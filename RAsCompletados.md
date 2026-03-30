# RAs Completados — EraMix

Registro de Resultados de Aprendizaje evidenciados en cada fase del proyecto.
Este archivo es una evidencia académica para el tribunal del Proyecto Intermodular.

## Estructura

Cada fase documenta:
1. RA y CEs concretos trabajados
2. Descripción técnica de la implementación
3. Justificación de cumplimiento del criterio
4. Rutas de archivos evidencia en el repositorio

---

## Fase 1: Arquitectura, Inicialización y Configuración del Entorno

### RA Entornos de Desarrollo (Sebas) — RA 4: Optimiza código empleando las herramientas disponibles en el entorno de desarrollo

**CE 4.f: Se han utilizado herramientas de control de versiones para el mantenimiento del código.**

- **Implementación:** Repositorio Git inicializado con estructura de ramas definida: rama `production` como rama principal siempre funcional, y ramas `feature/*` para desarrollo parcial. Se configura el remoto en GitHub (`https://github.com/SantiCode17/eramix.git`). El archivo `.gitignore` está configurado con exclusiones específicas para cada subproyecto (Expo/React Native, Spring Boot/Maven, Docker).
- **Justificación:** El control de versiones está operativo desde el primer momento del proyecto. La estrategia de ramas garantiza que `production` siempre contiene código funcional, y las ramas feature permiten desarrollo aislado.
- **Archivos evidencia:**
  - `/.gitignore`
  - `/backend/.gitignore`
  - `/mobile/.gitignore`

**CE 4.h: Se han identificado las características del repositorio y de la herramienta de control de versiones.**

- **Implementación:** El repositorio sigue una estructura monorepo con dos subproyectos independientes (`/mobile` y `/backend`). Se documentan las convenciones de commit (mensajes descriptivos con prefijo semántico: `feat`, `fix`, `docs`). El historial de commits es atómico y trazable.
- **Justificación:** La estructura del repositorio demuestra comprensión de las características de Git: ramas, commits atómicos, `.gitignore` contextual, y remoto GitHub.
- **Archivos evidencia:**
  - `/README.md` (sección de estructura de carpetas y desarrollo)
  - Historial de commits en GitHub

### RA Proyecto Intermodular — RA2: Diseña proyectos desarrollando explícitamente las fases que los componen

**CE 2.b: Se ha elaborado el guión de trabajo que se va a seguir para la elaboración del proyecto.**

- **Implementación:** El documento Master Prompt define 8+ fases secuenciales, cada una con objetivo, prerrequisitos, entregables concretos, instrucciones detalladas y criterios de completitud. Cada fase produce artefactos verificables.
- **Justificación:** El guión de trabajo está completamente elaborado antes de iniciar la implementación, con trazabilidad fase-RA-entregable.
- **Archivos evidencia:**
  - `/README.md` (tabla de RAs y fases)

**CE 2.c: Se han identificado las tareas y recursos necesarios para el desarrollo del proyecto.**

- **Implementación:** Se identifican todas las tecnologías (React Native/Expo, Spring Boot, MySQL, Docker), herramientas (VS Code, Git, Maven, npm), y recursos de infraestructura (Docker Compose, Render para despliegue). Cada dependencia del frontend y backend está documentada y justificada.
- **Justificación:** Los recursos están identificados y versionados en `package.json` (frontend) y `pom.xml` (backend).
- **Archivos evidencia:**
  - `/mobile/package.json`
  - `/backend/pom.xml`
  - `/docker-compose.yml`
  - `/docker-compose.dev.yml`
  - `/.env.example`

**CE 2.f: Se han especificado los recursos materiales y personales necesarios para el desarrollo del proyecto.**

- **Implementación:** Recursos materiales: JDK 21, Node.js LTS, Docker Engine, MySQL 8, dispositivos iOS (iPhone 16 Pro) y emuladores Android para testing. Recursos personales: desarrollador único con conocimientos full-stack.
- **Justificación:** Todos los recursos están documentados en el README y verificados su disponibilidad en el entorno de desarrollo Ubuntu.
- **Archivos evidencia:**
  - `/README.md` (sección de requisitos)

**CE 2.h: Se ha elaborado la documentación del diseño.**

- **Implementación:** El sistema de diseño European Glass está documentado en `DESIGN_SYSTEM.md` con especificación completa de: paleta cromática (hex y RGBA), sistema tipográfico (familias, tamaños, pesos), principios de glassmorphism (blur, opacidad, bordes), sistema de animaciones (duraciones, curvas de easing, tipos de microinteracción), y principios UX.
- **Justificación:** La documentación de diseño es exhaustiva y cubre todos los aspectos visuales de la aplicación con valores concretos y tokens reutilizables.
- **Archivos evidencia:**
  - `/DESIGN_SYSTEM.md`
  - `/mobile/src/constants/theme.ts` (tokens implementados en código)
  - `/mobile/tailwind.config.js` (configuración de Tailwind con tokens)

### RA Proyecto Intermodular — RA3: Planifica la ejecución del proyecto determinando el plan de intervención

**CE 3.a: Se ha secuenciado las actividades ordenándolas en función de las necesidades de desarrollo.**

- **Implementación:** Las fases están secuenciadas lógicamente: infraestructura → autenticación → modelo de datos → funcionalidades core → comunicación en tiempo real → despliegue. Cada fase tiene dependencias explícitas con las anteriores.
- **Justificación:** La secuenciación respeta las dependencias técnicas: no se puede implementar autenticación sin backend configurado, ni WebSockets sin modelo de datos.
- **Archivos evidencia:**
  - `/README.md` (tabla de RAs con estado)

**CE 3.b: Se han determinado los recursos y la logística necesaria para cada actividad.**

- **Implementación:** Cada fase especifica: dependencias npm/Maven necesarias, configuraciones requeridas, archivos a crear, y criterios de verificación. Los recursos de infraestructura (Docker, base de datos) se configuran con valores parametrizables via `.env`.
- **Justificación:** Los recursos están determinados con granularidad suficiente para la ejecución autónoma de cada fase.
- **Archivos evidencia:**
  - `/.env.example`
  - `/docker-compose.yml`
  - `/docker-compose.dev.yml`

**CE 3.h: Se ha elaborado la documentación del plan de trabajo.**

- **Implementación:** El README.md incluye instrucciones paso a paso para desarrollo local y producción, estructura de carpetas explicada, tabla de RAs y arquitectura del sistema.
- **Justificación:** La documentación permite a cualquier desarrollador clonar el repositorio y tener el entorno funcional siguiendo las instrucciones.
- **Archivos evidencia:**
  - `/README.md`
