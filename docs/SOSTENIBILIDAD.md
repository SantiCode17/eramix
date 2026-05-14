# 🌱 Sostenibilidad y ecodiseño en EraMix

> Documento de evidencia para el **RA 5** del módulo de **Sostenibilidad** (Proyecto Intermodular DAM, 2.º curso, 2025-2026).

## Por qué este documento existe

EraMix es un proyecto digital. No tiene impacto ambiental directo de infraestructura física —no fabricamos servidores, no operamos centros de datos—, pero sí tiene una **huella indirecta**: cada consulta a la base de datos consume electricidad, cada imagen descargada usa ancho de banda, cada réplica de contenedor activa ocupa CPU y memoria.

Este documento explica las decisiones técnicas que se han tomado para que EraMix consuma **lo mínimo necesario** para funcionar bien, sin sacrificar la experiencia del usuario. Cada decisión apunta a un archivo concreto del repositorio para que pueda verificarse.

## 1. Optimización de consultas a la base de datos

### 1.1. Índices SQL en columnas de filtrado frecuente

Un índice es como el índice de un libro: la base de datos consulta primero esa "tabla resumen" para saber qué páginas leer, en vez de hojear el libro entero. Sin índices, una búsqueda por ciudad de destino obligaría al motor a leer **todas** las filas de la tabla `user` y descartar las que no encajan.

EraMix declara índices en las columnas que se filtran u ordenan con frecuencia:

- `idx_user_email` — para el inicio de sesión.
- `idx_user_destination_city` — para descubrir gente en la misma ciudad.
- `idx_user_destination_country` — para filtros por país.
- `idx_user_home_uni`, `idx_user_host_uni` — para filtros por universidad.

Archivo: [`backend/src/main/resources/db/migration/V1__create_schema.sql`](../backend/src/main/resources/db/migration/V1__create_schema.sql) (líneas 60-72 de la tabla `user`).

### 1.2. Carga del perfil sin patrón N+1

El "patrón N+1" es como ir al supermercado a comprar tomates, volver a casa, volver a salir a comprar lechuga, volver a casa, volver a salir a comprar pan… en lugar de hacer una lista y comprar todo de una vez. Pasado a una app: si para mostrar el perfil de un usuario el sistema lanzara una consulta para el usuario, otra para sus universidades, otra para sus intereses, otra para sus idiomas y otra para sus fotos, estaríamos haciendo **cinco** viajes a la base de datos por cada perfil. Multiplicado por miles de usuarios al día, eso son millones de viajes evitables.

EraMix evita este patrón declarando un grafo de entidades anotado (`@NamedEntityGraph`) que dice al motor: "cuando cargues un usuario, tráete también sus universidades, intereses, idiomas y fotos en una única consulta con joins". El resultado es **un solo viaje** en lugar de cinco.

Archivo: [`backend/src/main/java/com/eramix/entity/User.java`](../backend/src/main/java/com/eramix/entity/User.java) (líneas 19-28 — `@NamedEntityGraph("User.profile")`).

### 1.3. Paginación basada en cursor

La paginación tradicional usa un offset: "dame los mensajes del 1000 al 1020". El motor tiene que contar mil filas antes de devolver las veinte que queremos. Si el usuario hace scroll hasta el mensaje 10.000, el coste crece linealmente.

La paginación basada en cursor cambia la pregunta: "dame los mensajes anteriores al ID 1020". El motor salta directamente al índice y devuelve las veinte siguientes. El coste es **constante**, no importa cuán atrás se vaya.

Archivo: [`backend/src/main/java/com/eramix/repository/MessageRepository.java`](../backend/src/main/java/com/eramix/repository/MessageRepository.java) (líneas 16-22 — método `findByConversationCursor`).

## 2. Caché Redis para reducir el trabajo del servidor

Algunas respuestas son casi siempre las mismas: el catálogo de universidades, los logros disponibles, la lista de recursos de emergencia de una ciudad. Recalcularlas en cada petición es trabajo desperdiciado.

La caché funciona como una libreta donde el servidor anota las respuestas que ha calculado: la próxima vez que alguien pida lo mismo, se lo entrega desde la libreta en lugar de volver a la base de datos. Cuanto más tiempo se mantenga una entrada en la libreta, más viajes a la base de datos se ahorran. Pero si se mantiene demasiado tiempo, los datos se quedan obsoletos.

EraMix usa Redis como esa libreta y le asigna un **tiempo de vida (TTL) específico a cada tipo de dato**, según cuánto cambia:

| Tipo de dato | TTL | Justificación |
|---|---|---|
| Tipos de cambio (Erasmus EUR ↔ moneda local) | 6 horas | Cambian poco a poco |
| Recursos de emergencia | 24 horas | Casi inmutables |
| Categorías y logros | 6-12 horas | Cambios infrecuentes |
| Preguntas de quiz cultural | 1 hora | Cambios planificados |
| Perfiles de usuario | 5 minutos | Cambian con la edición del usuario |
| Eventos próximos | 3 minutos | Se crean continuamente |
| Búsquedas globales y de eventos | 2 minutos | Resultados volátiles |
| Leaderboards de gamificación | 5 minutos | Se actualizan con la actividad |

Cada acierto en esta caché es una consulta SQL que no se ejecuta. En un servicio con catálogos casi inmutables, la ganancia agregada es relevante: menos CPU, menos red, menos lectura de disco en el motor de base de datos.

Archivo: [`backend/src/main/java/com/eramix/config/CacheConfig.java`](../backend/src/main/java/com/eramix/config/CacheConfig.java) (líneas 23-58 — mapa `cacheConfigurations`).

## 3. WebSockets eficientes

El chat en tiempo real depende de una conexión permanente entre el cliente y el servidor. Si esa conexión se trata mal, gasta más recursos de los necesarios. EraMix aplica tres decisiones:

### 3.1. Heartbeats razonables

Un *heartbeat* es como un "¿estás ahí?" que se envían cliente y servidor para confirmar que la conexión sigue viva. Si los latidos son muy frecuentes, hay tráfico constante por la red. Si son muy lentos, las desconexiones tardan en detectarse. EraMix usa **10 segundos**, un equilibrio probado en clientes móviles.

### 3.2. Reconexión con exponential backoff y jitter

Cuando la red se cae, el cliente intenta reconectarse. Si reintentara cada medio segundo, gastaría energía y ancho de banda. EraMix aplica un patrón estándar de la industria: **espera 1 segundo, luego 2, luego 4, luego 8… hasta un máximo de 30 segundos**. Además añade un margen aleatorio (jitter) para que, si miles de clientes se desconectaron a la vez por una caída del servidor, no se reconecten todos en el mismo instante creando un nuevo pico (efecto *thundering herd*).

### 3.3. Limpieza de sesiones inactivas

El servidor mantiene un mapa de "qué usuario tiene qué sesiones activas". Cuando un usuario cierra su última sesión, EraMix retira su entrada del mapa para que no crezca indefinidamente.

Archivos:
- Cliente: [`mobile/src/services/webSocketService.ts`](../mobile/src/services/webSocketService.ts) (líneas 56-65 heartbeats, 235-265 reconexión).
- Servidor: [`backend/src/main/java/com/eramix/websocket/WebSocketSessionManager.java`](../backend/src/main/java/com/eramix/websocket/WebSocketSessionManager.java) (líneas 38-55 limpieza).

## 4. Contenedores Docker ligeros

Cuando se despliega una aplicación con Docker, se construye una "imagen" que contiene todo lo necesario para que la app funcione. Una imagen pesada se descarga más despacio, se replica más despacio y ocupa más espacio en disco y en memoria. Una imagen más pequeña consume menos electricidad en cada despliegue y en cada arranque.

EraMix usa una técnica llamada *multi-stage build*: la primera fase de la imagen contiene el JDK completo, Maven y el código fuente para compilar la aplicación. La segunda fase, que es la que se publica, contiene únicamente el JRE (la parte estrictamente necesaria para ejecutar Java) y el JAR resultante. Todo lo demás —el código fuente, Maven, el JDK— se descarta.

Además se usa la variante **Alpine Linux** del JRE, una distribución mínima que reduce drásticamente el tamaño respecto a una imagen Debian o Ubuntu estándar. Y el proceso se ejecuta con un usuario `eramix` no privilegiado, no como root, por razones de seguridad.

Archivo: [`backend/Dockerfile`](../backend/Dockerfile) (16 líneas, dos `FROM` que delimitan las dos fases).

## 5. Despliegue proporcional a la demanda

En la orquestación con Kubernetes (carpeta [`k8s/`](../k8s/)), el manifest [`hpa.yaml`](../k8s/hpa.yaml) configura un *HorizontalPodAutoscaler*. Este componente vigila la carga del sistema (CPU y memoria) y ajusta el número de réplicas del backend en función de la demanda real: si por la noche hay poca actividad, se quedan unas pocas réplicas activas; si a las 21:00 hay una avalancha, se levantan más.

Esto evita el sobreprovisionamiento, que es el patrón antinatural de mantener decenas de servidores encendidos "por si acaso" cuando solo se usan en horas pico. Cada réplica innecesaria es electricidad gastada.

Archivo: [`k8s/hpa.yaml`](../k8s/hpa.yaml).

## 6. Elección consciente del proveedor cloud

El proyecto está preparado para ejecutarse en cualquier proveedor que acepte contenedores y manifests de Kubernetes. Para una hipotética publicación en producción se priorizarán proveedores con compromisos verificables de electricidad renovable:

- **Google Cloud** — neutral en carbono desde 2007, compromiso de operar con energía libre de carbono 24/7 en 2030.
- **Microsoft Azure** — compromiso de ser carbono-negativo en 2030.
- **Render** — electricidad 100 % renovable en sus regiones europeas.

Esta es una decisión de despliegue futuro, no una métrica medible en el código actual.

## Lo que NO afirmamos

Este proyecto **no incluye**:

- Mediciones reales del consumo eléctrico de los servidores.
- Cálculos cuantitativos de emisiones de CO₂.
- Auditoría externa de huella de carbono.

Las decisiones documentadas aquí son **cualitativas** y verificables en el código. Cualquier afirmación cuantitativa sería una estimación poco rigurosa, y preferimos no afirmar lo que no se ha medido.

## Tabla resumen de evidencias verificables

| Decisión | Archivo | Cómo comprobarlo |
|---|---|---|
| Índices SQL | [`backend/src/main/resources/db/migration/V1__create_schema.sql`](../backend/src/main/resources/db/migration/V1__create_schema.sql) | Buscar `INDEX idx_user_` |
| Anti N+1 | [`backend/src/main/java/com/eramix/entity/User.java`](../backend/src/main/java/com/eramix/entity/User.java) | `@NamedEntityGraph("User.profile")` |
| Cursor pagination | [`backend/src/main/java/com/eramix/repository/MessageRepository.java`](../backend/src/main/java/com/eramix/repository/MessageRepository.java) | Método `findByConversationCursor` |
| Caché Redis con TTLs | [`backend/src/main/java/com/eramix/config/CacheConfig.java`](../backend/src/main/java/com/eramix/config/CacheConfig.java) | Mapa `cacheConfigurations` |
| Heartbeats razonables | [`mobile/src/services/webSocketService.ts`](../mobile/src/services/webSocketService.ts) | `heartbeatIncoming`, `heartbeatOutgoing` |
| Exponential backoff | [`mobile/src/services/webSocketService.ts`](../mobile/src/services/webSocketService.ts) | Método `scheduleReconnect` |
| Limpieza de sesiones | [`backend/src/main/java/com/eramix/websocket/WebSocketSessionManager.java`](../backend/src/main/java/com/eramix/websocket/WebSocketSessionManager.java) | `handleSessionDisconnect` |
| Docker multi-stage | [`backend/Dockerfile`](../backend/Dockerfile) | Dos `FROM` separados |
| Usuario no root | [`backend/Dockerfile`](../backend/Dockerfile) | `USER eramix` |
| Autoescalado proporcional | [`k8s/hpa.yaml`](../k8s/hpa.yaml) | `HorizontalPodAutoscaler` |

---

*Documento mantenido por Santiago Sánchez March. Última revisión: mayo de 2026.*
