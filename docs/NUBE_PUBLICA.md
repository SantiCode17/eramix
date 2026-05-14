# ☁️ Despliegue en nube pública y configuración de redes

> Documento de evidencia para el **RA 3** del módulo de **Introducción a la nube pública** (Proyecto Intermodular DAM, 2.º curso, 2025-2026).

## Resumen

EraMix se despliega sobre infraestructura cloud reproducible. Este documento explica las decisiones técnicas tomadas en cuanto a **redes virtuales, servicios de cómputo y buenas prácticas de seguridad**, con enlace directo a los archivos del repositorio que las implementan. El despliegue está pensado para dos escenarios complementarios: un entorno local con Docker Compose y un entorno productivo orquestado con Kubernetes.

## 1. Servicio de cómputo en contenedor

### 1.1. Imagen Docker multi-stage

La aplicación se empaqueta en una imagen Docker construida con una técnica llamada *multi-stage build*. La idea es separar la fase de compilación de la fase de ejecución:

- **Fase 1 (build)**: parte de `eclipse-temurin:21-jdk-alpine`, copia el código fuente, descarga las dependencias con Maven y empaqueta el JAR.
- **Fase 2 (runtime)**: parte de `eclipse-temurin:21-jre-alpine` y copia únicamente el JAR resultante de la fase 1. Todo lo demás (JDK, Maven, código fuente) se descarta.

La imagen final pesa una fracción de la imagen de build. Esto agiliza el despliegue, reduce el espacio ocupado en el registry y minimiza la superficie de ataque (cuanto menos código en producción, menos vulnerabilidades potenciales).

Archivo: [`backend/Dockerfile`](../backend/Dockerfile).

### 1.2. Ejecución con usuario no privilegiado

Por defecto, los procesos en un contenedor Docker se ejecutan como `root`. Si una vulnerabilidad de la aplicación se explotara, el atacante tendría privilegios de administrador dentro del contenedor.

EraMix crea explícitamente un usuario `eramix` en el `Dockerfile` y ejecuta la aplicación con ese usuario:

```dockerfile
RUN addgroup -S eramix && adduser -S eramix -G eramix
COPY --from=build /app/target/*.jar app.jar
RUN chown eramix:eramix app.jar
USER eramix
```

Cualquier vulnerabilidad queda contenida en un proceso sin permisos administrativos.

## 2. Red privada con Docker Compose

El archivo [`docker-compose.yml`](../docker-compose.yml) define una red virtual privada llamada `eramix-network` (driver `bridge`) a la que se conectan tres servicios:

| Servicio | Imagen | Rol | Exposición |
|---|---|---|---|
| `db` | `mysql:8` | Base de datos relacional | Interna |
| `redis` | `redis:7-alpine` | Caché distribuida | Interna |
| `backend` | Imagen propia del Dockerfile | API REST + WebSocket | Puerto 8080 al host |

**Punto clave de seguridad**: los puertos de MySQL y Redis **no se exponen al host**. Solo el backend es accesible desde fuera de la red interna. Si un atacante quiere hablar con la base de datos, tiene que pasar primero por el backend, que es la superficie autenticada y validada.

### 2.1. Healthchecks y orden de arranque

Cada servicio declara un *healthcheck* que indica a Docker cómo comprobar si está sano:

- `db`: `mysqladmin ping`
- `redis`: `redis-cli ping`
- `backend`: depende de que `db` y `redis` estén sanos antes de arrancar (`depends_on` con `condition: service_healthy`).

Esto evita el clásico problema de arranque en el que el backend intenta conectarse a una base de datos que todavía no ha terminado de levantarse.

### 2.2. Variables sensibles inyectadas por entorno

Las credenciales (contraseña de MySQL, secreto JWT, claves de proveedores externos) **nunca se escriben en código**. Se referencian con la sintaxis `${VAR}` en `docker-compose.yml` y se inyectan desde un archivo `.env` que no se sube al repositorio (está en `.gitignore`).

El proyecto incluye un [`env.example`](../.env.example) que documenta cada variable con un valor de marcador, para que cualquier nuevo entorno se configure copiando `.env.example` a `.env` y editando los valores.

## 3. Orquestación con Kubernetes

Para el entorno productivo, el proyecto incluye 11 manifests Kubernetes en la carpeta [`k8s/`](../k8s/). Estos manifests describen cómo el clúster debe desplegar y operar la aplicación.

| Manifest | Rol |
|---|---|
| [`namespace.yaml`](../k8s/namespace.yaml) | Espacio aislado para los recursos de EraMix |
| [`configmap.yaml`](../k8s/configmap.yaml) | Configuración no sensible (puertos, hosts internos, CORS) |
| [`secret.yaml`](../k8s/secret.yaml) | Credenciales sensibles (JWT secret, DB password) |
| [`service-account.yaml`](../k8s/service-account.yaml) | Identidad del pod ante la API de Kubernetes |
| [`mysql.yaml`](../k8s/mysql.yaml) | StatefulSet de MySQL con volumen persistente |
| [`redis.yaml`](../k8s/redis.yaml) | StatefulSet de Redis |
| [`backend-deployment.yaml`](../k8s/backend-deployment.yaml) | Deployment con 2 réplicas y `RollingUpdate` |
| [`backend-service.yaml`](../k8s/backend-service.yaml) | Servicio interno que balancea entre las réplicas |
| [`hpa.yaml`](../k8s/hpa.yaml) | Autoescalador horizontal por CPU/memoria |
| [`ingress.yaml`](../k8s/ingress.yaml) | Entrada externa controlada (TLS, rutas) |
| [`pdb.yaml`](../k8s/pdb.yaml) | PodDisruptionBudget para mantener disponibilidad en mantenimientos |

### 3.1. Alta disponibilidad

El `Deployment` arranca con **2 réplicas** del backend. Si una cae o se reinicia para una actualización, la otra sigue sirviendo tráfico. La estrategia `RollingUpdate` con `maxUnavailable: 0` garantiza que durante una actualización siempre quede al menos una réplica viva.

El `PodDisruptionBudget` (`pdb.yaml`) refuerza esta política para mantenimientos del clúster: indica al planificador que no puede tirar abajo todas las réplicas simultáneamente.

### 3.2. Autoescalado horizontal

El `HorizontalPodAutoscaler` (`hpa.yaml`) ajusta el número de réplicas en función de la carga real de CPU y memoria. Si el sistema está tranquilo, mantiene las 2 réplicas mínimas; si recibe un pico, escala automáticamente. Esto evita tanto la sobreprovisión (gastar electricidad en réplicas inactivas) como la falta de capacidad bajo carga.

### 3.3. Entrada externa controlada

El `Ingress` es el único punto desde el que se accede al sistema desde fuera. Centraliza:

- Terminación TLS (HTTPS) en un único lugar.
- Reglas de enrutamiento por path y por host.
- Cabeceras de seguridad (HSTS, X-Frame-Options, etc., si se configuran).

El resto de los servicios (MySQL, Redis, el propio backend) permanece aislado en la red interna del clúster.

### 3.4. Observabilidad

El `Deployment` del backend incluye anotaciones para que Prometheus scrape métricas del endpoint `/actuator/prometheus`:

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8080"
  prometheus.io/path: "/actuator/prometheus"
```

Esto permite monitorizar latencia, throughput, errores y consumo de recursos en producción, condición necesaria para operar el sistema de forma responsable.

## 4. CI/CD con GitHub Actions

El despliegue está automatizado mediante tres workflows en [`.github/workflows/`](../.github/workflows/):

| Workflow | Disparador | Acciones |
|---|---|---|
| [`backend-ci.yml`](../.github/workflows/backend-ci.yml) | Push o PR | Build con Maven, empaquetado del JAR |
| [`mobile-ci.yml`](../.github/workflows/mobile-ci.yml) | Push o PR | `npm install`, `tsc --noEmit`, `eslint` |
| [`deploy.yml`](../.github/workflows/deploy.yml) | Tras éxito de `backend-ci` en `main` | Aplica manifests con `kubectl` y verifica rollout |

El workflow `deploy.yml` etiqueta cada imagen con el SHA corto del commit, lo que permite trazabilidad y rollback inmediato si una versión rompe algo en producción.

## 5. Buenas prácticas de seguridad aplicadas

| Práctica | Implementación |
|---|---|
| Mínimo privilegio | Usuario `eramix` no root en el contenedor |
| Imagen mínima | JRE Alpine multi-stage |
| Secrets fuera del código | `.env` + `k8s/secret.yaml`, ambos fuera del repositorio |
| Red privada | Servicios internos no expuestos al host ni a internet |
| TLS centralizado | Terminación en el Ingress |
| Stateless backend | JWT, sin sesión en servidor → replicable horizontalmente |
| Healthchecks | Detección automática de servicios degradados |
| Observabilidad | Métricas Prometheus + endpoints Actuator |
| Rollback rápido | Imágenes etiquetadas por SHA, `kubectl rollout undo` |
| Aislamiento | Cada componente en su propio contenedor |

## 6. Tabla resumen de evidencias verificables

| Decisión | Archivo | Cómo comprobarlo |
|---|---|---|
| Multi-stage build | [`backend/Dockerfile`](../backend/Dockerfile) | Dos `FROM` separados |
| Usuario no privilegiado | [`backend/Dockerfile`](../backend/Dockerfile) | `USER eramix` |
| Red privada local | [`docker-compose.yml`](../docker-compose.yml) | `networks: eramix-network` |
| Healthchecks | [`docker-compose.yml`](../docker-compose.yml) | Bloques `healthcheck` en `db` y `redis` |
| Variables por entorno | [`docker-compose.yml`](../docker-compose.yml) | Sintaxis `${VAR}` |
| Documentación de variables | [`.env.example`](../.env.example) | 19 variables documentadas |
| Manifests Kubernetes | [`k8s/`](../k8s/) | 11 ficheros YAML |
| Deployment con réplicas | [`k8s/backend-deployment.yaml`](../k8s/backend-deployment.yaml) | `replicas: 2`, `RollingUpdate` |
| Autoescalado | [`k8s/hpa.yaml`](../k8s/hpa.yaml) | `HorizontalPodAutoscaler` |
| Alta disponibilidad | [`k8s/pdb.yaml`](../k8s/pdb.yaml) | `PodDisruptionBudget` |
| Entrada externa controlada | [`k8s/ingress.yaml`](../k8s/ingress.yaml) | Recurso `Ingress` |
| Secrets fuera del repo | [`.gitignore`](../.gitignore) | `.env` y `*.secret` excluidos |
| CI/CD | [`.github/workflows/`](../.github/workflows/) | Tres workflows |

---

*Documento mantenido por Santiago Sánchez March. Última revisión: mayo de 2026.*
