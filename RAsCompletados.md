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

---

## Fase 2: Design System — European Glass (Componentes Atómicos)

### RA Multimedia (DAM) — CE 2.a: Se han analizado las tecnologías disponibles para la creación de contenido visual animado

- **Implementación:** Se evalúan las APIs de animación disponibles en React Native: `Animated` (nativa, sin dependencia extra, rendimiento con `useNativeDriver`), `Reanimated` (más potente pero mayor footprint), y la integración con `expo-haptics` para feedback háptico. Se selecciona `Animated` API para mantener ligereza y compatibilidad. Se implementan 4 hooks de animación reutilizables: `useFadeIn` (opacity timing), `useSlideUp` (parallel opacity + translateY), `useScalePress` (spring scale + haptic feedback), `useStaggeredList` (array de animaciones escalonadas).
- **Justificación:** El análisis compara capacidades, rendimiento y footprint de las tecnologías. Se selecciona la más adecuada para cada caso de uso con justificación técnica. Se respeta `AccessibilityInfo.isReduceMotionEnabled` para accesibilidad.
- **Archivos evidencia:**
  - `/mobile/src/design-system/animations/useFadeIn.ts`
  - `/mobile/src/design-system/animations/useSlideUp.ts`
  - `/mobile/src/design-system/animations/useScalePress.ts`
  - `/mobile/src/design-system/animations/useStaggeredList.ts`
  - `/mobile/src/design-system/animations/index.ts`

### RA Multimedia (DAM) — CE 2.b: Se ha implementado una librería de componentes visuales reutilizables con efectos de glassmorphism

- **Implementación:** Se implementan 14 componentes atómicos del Design System "European Glass": 4 componentes glass (`GlassCard`, `GlassButton`, `GlassInput`, `GlassModal`) con `expo-blur` BlurView y `expo-linear-gradient`, 8 componentes menores (`Avatar`, `Badge`, `Chip`, `Tag`, `Divider`, `LoadingSpinner`, `EmptyState`, `ErrorState`), y 2 componentes de navegación (`TabBar`, `Header`). Cada componente: acepta variantes configurables, usa tokens del design system, respeta accesibilidad, incluye microinteracciones (spring scale, shimmer, floating labels).
- **Justificación:** La librería es cohesiva, reutilizable y extensible. Se emplea composición de componentes, tipado estricto TypeScript, y separación de responsabilidades.
- **Archivos evidencia:**
  - `/mobile/src/design-system/components/GlassCard/GlassCard.tsx`
  - `/mobile/src/design-system/components/GlassButton/GlassButton.tsx`
  - `/mobile/src/design-system/components/GlassInput/GlassInput.tsx`
  - `/mobile/src/design-system/components/GlassModal/GlassModal.tsx`
  - `/mobile/src/design-system/components/Avatar/Avatar.tsx`
  - `/mobile/src/design-system/components/Badge/Badge.tsx`
  - `/mobile/src/design-system/components/Chip/Chip.tsx`
  - `/mobile/src/design-system/components/Tag/Tag.tsx`
  - `/mobile/src/design-system/components/Divider/Divider.tsx`
  - `/mobile/src/design-system/components/LoadingSpinner/LoadingSpinner.tsx`
  - `/mobile/src/design-system/components/EmptyState/EmptyState.tsx`
  - `/mobile/src/design-system/components/ErrorState/ErrorState.tsx`
  - `/mobile/src/design-system/components/TabBar/TabBar.tsx`
  - `/mobile/src/design-system/components/Header/Header.tsx`
  - `/mobile/src/design-system/components/index.ts`

### RA Proyecto Intermodular — RA3: CE 3.f: Se han previsto los mecanismos necesarios para verificar la calidad del proyecto

- **Implementación:** Se crea una pantalla `ComponentGallery` (accesible solo en modo `__DEV__`) que renderiza todos los componentes del design system con sus variantes, estados (loading, disabled, error, success), y configuraciones. Permite verificación visual en tiempo real durante el desarrollo. El compilador TypeScript verifica `tsc --noEmit` con 0 errores en toda la librería.
- **Justificación:** La galería de componentes funciona como mecanismo de QA visual: cada componente se muestra en contexto real con todas sus variantes para detectar defectos visuales.
- **Archivos evidencia:**
  - `/mobile/src/screens/dev/ComponentGallery.tsx`
  - `/mobile/src/navigation/RootNavigator.tsx` (registro condicional `__DEV__`)

### RA Proyecto Intermodular — RA2: CE 2.a: Se ha desarrollado adecuadamente la estructura modular del proyecto

- **Implementación:** La arquitectura del design system sigue el patrón Atomic Design: tokens base (`tokens.ts`, `fonts.ts`) → hooks de animación → componentes atómicos → barrel exports con re-exportaciones limpias. Cada componente tiene su directorio con componente + barrel index. El sistema es importable desde un único punto de entrada: `import { GlassCard, colors } from "@/design-system"`.
- **Justificación:** La modularidad permite importación selectiva, tree-shaking eficiente, y navegación clara del código. Las convenciones de nombrado y estructura son consistentes.
- **Archivos evidencia:**
  - `/mobile/src/design-system/tokens.ts`
  - `/mobile/src/design-system/fonts.ts`
  - `/mobile/src/design-system/index.ts`

### RA Proyecto Intermodular — RA2: CE 2.d: Se han definido los estándares de calidad visual y de experiencia de usuario

- **Implementación:** El sistema de tokens tipado con `as const` garantiza consistencia de colores, tipografía, espaciado, radios de borde, opacidades y sombras en todos los componentes. La paleta cromática EU (deep blue #003399, star yellow #FFCC00, orange #FF6B2B) se aplica uniformemente. Se implementa carga de fuentes custom (Inter + Space Grotesk) con pantalla de carga hasta que estén disponibles.
- **Justificación:** Los estándares de calidad visual están codificados como tokens inmutables, garantizando coherencia y mantenibilidad.
- **Archivos evidencia:**
  - `/mobile/src/design-system/tokens.ts`
  - `/mobile/src/design-system/fonts.ts`
  - `/mobile/App.tsx` (carga de fuentes con fallback)

---

## Fase 3: Base de Datos — Modelo Relacional Completo y Capa JPA

### RA Acceso a Datos — RA2: Desarrolla aplicaciones que gestionan información almacenada en bases de datos relacionales

**CE 2.a: Se han identificado las ventajas e inconvenientes de los distintos modelos de datos.**

- **Implementación:** Se diseña un modelo relacional normalizado (3NF) con 16 tablas que cubren: gestión de usuarios, internacionalización (idiomas con ISO 639-1, universidades europeas con coordenadas), social graph (amistades, solicitudes), mensajería, eventos, stories y notificaciones. Se documenta un diagrama ERD completo en Mermaid con todas las cardinalidades, PKs, FKs y restricciones.
- **Justificación:** El modelo relacional se selecciona por la naturaleza de los datos (relaciones muchos-a-muchos en intereses/idiomas, integridad referencial en amistades, consistencia transaccional en mensajería). Se justifica frente a NoSQL por la necesidad de JOINs complejos y constraints ACID.
- **Archivos evidencia:**
  - `/docs/database/ERD.md`

**CE 2.b: Se han aplicado mecanismos de mapeo entre objetos y tablas (ORM).**

- **Implementación:** Se implementan 15 entidades JPA con Hibernate 6 mapeando fielmente el esquema SQL: relaciones `@ManyToOne` LAZY, `@ManyToMany` con join table (`user_interest`), `@OneToMany` con cascada, `@IdClass` para PKs compuestas (`UserLanguage`, `EventParticipant`), `@NamedEntityGraph("User.profile")` para carga optimizada del perfil. `BaseEntity` (MappedSuperclass) provee id autoincremental y auditoría (`@CreatedDate`, `@LastModifiedDate`).
- **Justificación:** El mapeo ORM elimina SQL manual y garantiza type-safety. Las estrategias de fetch (LAZY por defecto) previenen el problema N+1. Los EntityGraphs permiten carga selectiva.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/entity/User.java`
  - `/backend/src/main/java/com/eramix/entity/BaseEntity.java`
  - `/backend/src/main/java/com/eramix/entity/University.java`
  - `/backend/src/main/java/com/eramix/entity/Interest.java`
  - `/backend/src/main/java/com/eramix/entity/Language.java`
  - `/backend/src/main/java/com/eramix/entity/UserLanguage.java`
  - `/backend/src/main/java/com/eramix/entity/UserPhoto.java`
  - `/backend/src/main/java/com/eramix/entity/FriendRequest.java`
  - `/backend/src/main/java/com/eramix/entity/Friendship.java`
  - `/backend/src/main/java/com/eramix/entity/Conversation.java`
  - `/backend/src/main/java/com/eramix/entity/Message.java`
  - `/backend/src/main/java/com/eramix/entity/Event.java`
  - `/backend/src/main/java/com/eramix/entity/EventParticipant.java`
  - `/backend/src/main/java/com/eramix/entity/Story.java`
  - `/backend/src/main/java/com/eramix/entity/StoryView.java`
  - `/backend/src/main/java/com/eramix/entity/Notification.java`
  - `/backend/src/main/java/com/eramix/entity/RefreshToken.java`

**CE 2.c: Se han utilizado patrones DAO/Repository para separar la lógica de acceso a datos.**

- **Implementación:** Se implementan 16 interfaces Spring Data JPA que extienden `JpaRepository`. Cada repositorio define derived queries (method name parsing), `@Query` con JPQL para consultas complejas, y `@Modifying` para operaciones bulk. Ejemplos: `UserRepository.findByFilters()` con parámetros nullable, `MessageRepository.markAsRead()` como UPDATE bulk, `FriendRequestRepository.findBetweenUsers()` con consulta bidireccional.
- **Justificación:** El patrón Repository de Spring Data elimina implementación boilerplate. Las queries derivadas garantizan type-safety en tiempo de compilación. La separación de capas (Entity → Repository → Service → Controller) permite testing independiente.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/repository/UserRepository.java`
  - `/backend/src/main/java/com/eramix/repository/InterestRepository.java`
  - `/backend/src/main/java/com/eramix/repository/LanguageRepository.java`
  - `/backend/src/main/java/com/eramix/repository/UniversityRepository.java`
  - `/backend/src/main/java/com/eramix/repository/UserPhotoRepository.java`
  - `/backend/src/main/java/com/eramix/repository/UserLanguageRepository.java`
  - `/backend/src/main/java/com/eramix/repository/FriendRequestRepository.java`
  - `/backend/src/main/java/com/eramix/repository/FriendshipRepository.java`
  - `/backend/src/main/java/com/eramix/repository/ConversationRepository.java`
  - `/backend/src/main/java/com/eramix/repository/MessageRepository.java`
  - `/backend/src/main/java/com/eramix/repository/EventRepository.java`
  - `/backend/src/main/java/com/eramix/repository/EventParticipantRepository.java`
  - `/backend/src/main/java/com/eramix/repository/StoryRepository.java`
  - `/backend/src/main/java/com/eramix/repository/StoryViewRepository.java`
  - `/backend/src/main/java/com/eramix/repository/NotificationRepository.java`
  - `/backend/src/main/java/com/eramix/repository/RefreshTokenRepository.java`

**CE 2.d: Se han definido e implementado DTOs para la transferencia de datos entre capas.**

- **Implementación:** Se implementan 27 DTOs organizados en subpaquetes por dominio: `auth` (RegisterRequest, LoginRequest, AuthResponse, RefreshTokenRequest), `user` (UserProfileResponse con inner classes UniversitySummary/InterestSummary/UserLanguageSummary, UserUpdateRequest, UserLanguageRequest, UserPhotoResponse, LocationUpdateRequest, UserSearchRequest, NearbyUserResponse, UniversityResponse), `social` (FriendRequestResponse/Create/Action, FriendshipResponse), `messaging` (ConversationResponse, MessageResponse, SendMessageRequest), `event` (EventRequest/Response, EventParticipantRequest/Response), `story` (StoryResponse, StoryCreateRequest), `notification` (NotificationResponse), y genéricos (ApiResponse<T>, PageResponse<T>).
- **Justificación:** Los DTOs garantizan que nunca se expone `passwordHash` ni datos internos. Las validaciones con Bean Validation (`@NotBlank`, `@Email`, `@Size`, `@Past`, `@DecimalMin/Max`) protegen la integridad de los datos de entrada. El patrón Request/Response separa claramente input de output.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/dto/auth/`
  - `/backend/src/main/java/com/eramix/dto/user/`
  - `/backend/src/main/java/com/eramix/dto/social/`
  - `/backend/src/main/java/com/eramix/dto/messaging/`
  - `/backend/src/main/java/com/eramix/dto/event/`
  - `/backend/src/main/java/com/eramix/dto/story/`
  - `/backend/src/main/java/com/eramix/dto/notification/`
  - `/backend/src/main/java/com/eramix/dto/ApiResponse.java`
  - `/backend/src/main/java/com/eramix/dto/PageResponse.java`

**CE 2.e: Se han utilizado mecanismos de migración de esquema de base de datos.**

- **Implementación:** Se utiliza Flyway para gestión de migraciones versionadas: V1 (DDL completo: 16 tablas con índices, FKs, constraints), V2 (datos semilla: 30 idiomas, 44 intereses, 30 universidades europeas), V3 (stored procedure Haversine como migración Java con `BaseJavaMigration`). Configuración: `ddl-auto=validate` (Hibernate solo valida, no modifica), `baseline-on-migrate=true`.
- **Justificación:** Flyway garantiza migraciones reproducibles, versionadas y auditables. La validación Hibernate verifica concordancia entidades-esquema. V3 como migración Java resuelve la incompatibilidad de Flyway Community con delimitadores MySQL en stored procedures.
- **Archivos evidencia:**
  - `/backend/src/main/resources/db/migration/V1__create_schema.sql`
  - `/backend/src/main/resources/db/migration/V2__seed_data.sql`
  - `/backend/src/main/java/com/eramix/migration/V3__create_haversine_procedure.java`
  - `/backend/src/main/resources/application.properties`

**CE 2.f: Se han implementado procedimientos almacenados y funciones geoespaciales.**

- **Implementación:** Se implementa el stored procedure `findUsersNearby` que utiliza la fórmula de Haversine para calcular distancias esféricas entre coordenadas geográficas. Parámetros: latitud/longitud de referencia, radio en km, y usuario a excluir. Incluye clamping con `LEAST/GREATEST` para prevenir errores de dominio en `ACOS`. Filtra usuarios activos con coordenadas y ordena por distancia ascendente.
- **Justificación:** La búsqueda por proximidad es funcionalidad core de la app (encontrar Erasmus cercanos). El stored procedure en MySQL es más eficiente que calcular distancias en la capa de aplicación para datasets grandes.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/migration/V3__create_haversine_procedure.java`
  - `/docs/database/ERD.md` (documentación del procedimiento)

### RA Proyecto Intermodular — RA2: Diseña proyectos desarrollando explícitamente las fases que los componen

**CE 2.e: Se ha definido la estructura de datos del proyecto con trazabilidad completa.**

- **Implementación:** El modelo de datos está documentado en un ERD Mermaid con 16 tablas, todas las relaciones con cardinalidad, y notas de diseño. La implementación JPA refleja fielmente el ERD. Los datos semilla incluyen contenido real (universidades europeas con coordenadas, idiomas ISO, intereses categorizados con emojis).
- **Justificación:** Existe trazabilidad directa ERD → SQL → Entidad JPA → Repositorio → DTO. Cada capa es verificable independientemente.
- **Archivos evidencia:**
  - `/docs/database/ERD.md`
  - `/backend/src/main/resources/db/migration/V1__create_schema.sql`
  - `/backend/src/main/java/com/eramix/entity/`

**CE 2.h: Se ha elaborado la documentación técnica del modelo de datos.**

- **Implementación:** Documentación completa incluye: ERD con Mermaid (renderizable en GitHub), convenciones de nombrado (snake_case SQL, camelCase Java), estrategia de indexación documentada, y 6 enums documentados. Cada entidad Java tiene annotations que documentan su mapeo.
- **Justificación:** La documentación técnica permite a cualquier desarrollador comprender el modelo sin necesidad de leer el código SQL.
- **Archivos evidencia:**
  - `/docs/database/ERD.md`
  - `/backend/src/main/java/com/eramix/entity/enums/`

---

## Fase 4: Backend — Autenticación, Seguridad y Gestión de Sesión

### RA PSP (Programación de Servicios y Procesos) — RA4: Desarrolla aplicaciones que utilizan servicios en red de forma segura

**CE 4.a: Se han implementado mecanismos de autenticación mediante tokens JWT.**

- **Implementación:** Sistema de autenticación stateless basado en JWT (jjwt 0.12.6) con access tokens de 15 minutos. Los tokens contienen claims: `sub` (userId), `email`, `roles`. Se firma con HMAC-SHA384 usando una clave secreta configurable. El `JwtTokenProvider` encapsula generación, validación y extracción de claims. El `JwtAuthenticationFilter` (OncePerRequestFilter) extrae el Bearer token del header `Authorization`, valida y establece el `SecurityContext` con el userId como principal y el rol como `GrantedAuthority`.
- **Justificación:** JWT permite autenticación sin estado en el servidor, ideal para APIs REST y escalabilidad horizontal. La separación en Provider + Filter sigue el principio SRP.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/security/JwtTokenProvider.java`
  - `/backend/src/main/java/com/eramix/security/JwtAuthenticationFilter.java`
  - `/backend/src/main/resources/application.properties` (configuración JWT)

**CE 4.b: Se ha configurado Spring Security para proteger endpoints de la API.**

- **Implementación:** `SecurityConfig` define una cadena de filtros: CORS habilitado → CSRF deshabilitado (API stateless) → sesiones STATELESS → rutas públicas (`/api/v1/auth/**`, `/api/health`, `/ws/**`) con `permitAll()` → el resto requiere autenticación. Se inyecta `JwtAuthenticationFilter` antes de `UsernamePasswordAuthenticationFilter`. Bean `AuthenticationManager` para autenticación programática. Bean `PasswordEncoder` con BCrypt.
- **Justificación:** La configuración de seguridad protege todos los endpoints por defecto y solo expone explícitamente los públicos, siguiendo el principio de menor privilegio.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/config/SecurityConfig.java`
  - `/backend/src/main/java/com/eramix/config/CorsConfig.java`

**CE 4.c: Se ha implementado refresh token rotation para gestión segura de sesiones.**

- **Implementación:** Refresh tokens opacos (UUID) de 30 días almacenados como hash SHA-256 en la tabla `refresh_tokens`. Al hacer refresh: se busca por hash, se verifica expiración, se elimina el antiguo (rotación), y se genera un nuevo par access+refresh. Al hacer logout se revoca el token. Al resetear contraseña se revocan TODOS los tokens del usuario. `AuthService` centraliza las 7 operaciones: register, login, refresh, logout, forgotPassword, resetPassword, deleteAccount.
- **Justificación:** La rotación de refresh tokens mitiga el riesgo de tokens robados: cada uso genera un nuevo token y el anterior es inválido. El almacenamiento como hash SHA-256 protege los tokens en caso de brecha de datos.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/service/AuthService.java`
  - `/backend/src/main/java/com/eramix/entity/RefreshToken.java`
  - `/backend/src/main/java/com/eramix/repository/RefreshTokenRepository.java`

**CE 4.d: Se ha implementado manejo de errores y excepciones de seguridad.**

- **Implementación:** 5 excepciones de dominio tipadas: `UserNotFoundException` (404), `EmailAlreadyExistsException` (409), `InvalidCredentialsException` (401), `TokenExpiredException` (401), `InvalidTokenException` (401). `GlobalExceptionHandler` con `@RestControllerAdvice` maneja cada excepción y devuelve respuestas JSON estandarizadas con timestamp, status, error, message y path. El filtro JWT captura excepciones de token y responde con 401 directamente sin pasar al filter chain.
- **Justificación:** Las excepciones tipadas permiten respuestas HTTP semánticas y mensajes claros. El manejo centralizado garantiza consistencia en todas las respuestas de error.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/exception/UserNotFoundException.java`
  - `/backend/src/main/java/com/eramix/exception/EmailAlreadyExistsException.java`
  - `/backend/src/main/java/com/eramix/exception/InvalidCredentialsException.java`
  - `/backend/src/main/java/com/eramix/exception/TokenExpiredException.java`
  - `/backend/src/main/java/com/eramix/exception/InvalidTokenException.java`
  - `/backend/src/main/java/com/eramix/exception/GlobalExceptionHandler.java`

### RA Introducción a la Nube Pública — CE 3.b: Se han identificado las capas de seguridad necesarias

- **Implementación:** Se implementan múltiples capas de seguridad: (1) contraseñas hasheadas con BCrypt, (2) JWT firmado con HMAC-SHA384, (3) refresh tokens almacenados como SHA-256, (4) CORS configurado con orígenes permitidos, (5) CSRF deshabilitado por diseño stateless, (6) validación de entrada con Bean Validation, (7) separación de rutas públicas y protegidas. La configuración es externalizable via variables de entorno para distintos entornos (dev/staging/prod).
- **Justificación:** La defensa en profundidad aplica seguridad en cada capa: red (CORS), transporte (JWT), almacenamiento (hash), y aplicación (validación).
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/config/SecurityConfig.java`
  - `/backend/src/main/java/com/eramix/config/CorsConfig.java`
  - `/backend/src/main/resources/application.properties`

### RA Proyecto Intermodular — RA4: Realiza proyectos verificando el cumplimiento de los requisitos funcionales

**CE 4.b: Se han verificado los endpoints de la API mediante pruebas funcionales.**

- **Implementación:** Se crea una colección Postman con 12 requests organizados en 4 carpetas: Auth Flow (register, register duplicado, register inválido, login, login inválido, refresh, logout), Password Recovery (forgot-password, reset-password, reset-token inválido), Account Management (delete con auth, delete sin auth), Health Check. Cada request incluye tests automáticos que verifican status codes y estructura de respuesta. Variables de colección (`accessToken`, `refreshToken`, `resetToken`) se auto-rellenan.
- **Justificación:** La colección Postman documenta la API y permite verificación reproducible de todos los flujos: happy path y casos de error.
- **Archivos evidencia:**
  - `/docs/api/auth-collection.json`

**CE 4.c: Se ha verificado el correcto funcionamiento del sistema de autenticación completo.**

- **Implementación:** Verificación end-to-end del flujo completo: Register → Login → Refresh (token rotation) → Forgot Password → Reset Password → Login con nueva contraseña → Delete Account. Se verifica compilación Maven limpia, arranque del backend con Flyway+JPA, y respuestas HTTP correctas con curl. Los 7 endpoints responden con los status codes esperados (201, 200, 401, 409).
- **Justificación:** La verificación cubre el ciclo de vida completo de un usuario, incluyendo recuperación de contraseña y eliminación de cuenta, garantizando la integridad del sistema.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/controller/AuthController.java`
  - `/docs/api/auth-collection.json`

---

## Fase 5: Backend — Lógica de Negocio Principal

### RA Acceso a Datos — RA2: Desarrolla aplicaciones que gestionan información almacenada en bases de datos relacionales

**CE 2.g: Se ha implementado la lógica de negocio con transacciones y validaciones complejas.**

- **Implementación:** Se implementan 7 servicios transaccionales con `@Transactional`: `UserService` (gestión de perfiles con reemplazo atómico de intereses/idiomas), `FriendService` (flujo solicitud→aceptación→creación automática de conversación), `SearchService` (búsqueda por filtros combinados y proximidad Haversine), `EventService` (CRUD con control de propiedad y límite de participantes), `StoryService` (ciclo de vida 24h con filtrado de stories activas), `NotificationService` (CRUD con conteo optimizado), `FileStorageService` (almacenamiento local con validación MIME/tamaño).
- **Justificación:** Cada servicio encapsula lógica de negocio compleja: FriendService crea Friendship + Conversation en una sola transacción al aceptar solicitud, EventService valida maxParticipants antes de unirse, StoryService filtra por expiración y amistades activas.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/service/UserService.java`
  - `/backend/src/main/java/com/eramix/service/FriendService.java`
  - `/backend/src/main/java/com/eramix/service/SearchService.java`
  - `/backend/src/main/java/com/eramix/service/EventService.java`
  - `/backend/src/main/java/com/eramix/service/StoryService.java`
  - `/backend/src/main/java/com/eramix/service/NotificationService.java`
  - `/backend/src/main/java/com/eramix/service/FileStorageService.java`

**CE 2.h: Se han implementado consultas avanzadas con JPQL y SQL nativo.**

- **Implementación:** `SearchService.findNearbyUsers()` usa `@Query(nativeQuery=true)` con fórmula de Haversine completa para búsqueda por proximidad geográfica. `UserRepository.findByFilters()` usa JPQL con parámetros nullable para búsqueda combinada. `StoryRepository` filtra por `expiresAt > NOW()`. `FriendshipRepository` busca relaciones bidireccionales.
- **Justificación:** Las consultas nativas se usan exclusivamente donde JPQL no puede expresar la lógica (Haversine con funciones trigonométricas). JPQL se prefiere para el resto por type-safety.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/service/SearchService.java`
  - `/backend/src/main/java/com/eramix/repository/UserRepository.java`
  - `/backend/src/main/java/com/eramix/repository/StoryRepository.java`
  - `/backend/src/main/java/com/eramix/repository/FriendshipRepository.java`

### RA PSP — RA3: Programa mecanismos de comunicación en red empleando sockets y analizando el escenario de ejecución

**CE 3.a: Se han diseñado y documentado endpoints RESTful siguiendo convenciones HTTP.**

- **Implementación:** Se implementan 6 controladores REST con 39 endpoints totales: `UserController` (7 endpoints: GET/PUT/DELETE perfil, ubicación, fotos), `FriendController` (9 endpoints: solicitudes CRUD, amigos, bloqueo), `SearchController` (4 endpoints: filtros, nearby, ciudad, país), `EventController` (10 endpoints: CRUD eventos, participantes, join/leave), `StoryController` (5 endpoints: crear, eliminar, ver, feed, por usuario), `NotificationController` (5 endpoints: listar, contar, leer, leer todas, eliminar). Cada endpoint sigue convenciones REST: verbos HTTP semánticos, rutas con sustantivos plurales, respuestas envueltas en `ApiResponse<T>`.
- **Justificación:** La API es predecible y autodocumentada: POST para creación, GET para lectura, PUT para actualización, DELETE para eliminación. Los status codes son semánticos (200 OK, 201 Created, 404 Not Found).
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/controller/UserController.java`
  - `/backend/src/main/java/com/eramix/controller/FriendController.java`
  - `/backend/src/main/java/com/eramix/controller/SearchController.java`
  - `/backend/src/main/java/com/eramix/controller/EventController.java`
  - `/backend/src/main/java/com/eramix/controller/StoryController.java`
  - `/backend/src/main/java/com/eramix/controller/NotificationController.java`

### RA Multimedia (DAM) — CE 6.a: Se han implementado mecanismos de gestión de contenido multimedia

- **Implementación:** `FileStorageService` gestiona upload de fotos con: validación de tipo MIME (JPEG, PNG, GIF, WEBP), límite de tamaño (5MB), generación de nombres UUID para evitar colisiones, almacenamiento en sistema de archivos local (`./uploads/photos/`), URL pública servida via `WebMvcConfig` resource handler. `StoryController` acepta `multipart/form-data` para upload de stories con caption opcional.
- **Justificación:** La gestión de contenido multimedia incluye validaciones de seguridad (tipo MIME, tamaño), unicidad de nombres (UUID), y servicio estático de archivos.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/service/FileStorageService.java`
  - `/backend/src/main/java/com/eramix/config/WebMvcConfig.java`
  - `/backend/src/main/java/com/eramix/controller/StoryController.java`

### RA Proyecto Intermodular — RA4: Realiza proyectos verificando el cumplimiento de los requisitos funcionales

**CE 4.b: Se han verificado los endpoints de la API mediante pruebas funcionales.**

- **Implementación:** Se crea una colección Postman con 40 requests organizados en 7 carpetas: Auth Setup (1 request con auto-token), User Profile (7 requests), Friends (9 requests), Search & Matching (4 requests), Events (11 requests), Stories (5 requests), Notifications (5 requests). Se verifican todos los endpoints con curl durante desarrollo: registro, perfil, actualización de ubicación, creación de eventos, feed de stories, notificaciones. Todos responden correctamente con `ApiResponse<T>`.
- **Justificación:** La colección documenta exhaustivamente la API de negocio y permite verificación reproducible de todos los flujos.
- **Archivos evidencia:**
  - `/docs/api/business-logic-collection.json`

**CE 4.d: Se ha verificado la integración entre capas del backend.**

- **Implementación:** Verificación end-to-end: (1) Build Maven: `mvnw clean compile -DskipTests` → BUILD SUCCESS (102 archivos fuente), (2) Server startup: Tomcat en puerto 8090, Flyway 3 migraciones, Hibernate validación OK, FileStorageService init OK, (3) Auth: POST /register → JWT + perfil, (4) Profile: GET/PUT /users/me → CRUD completo, (5) Location: PUT /me/location → coordenadas actualizadas, (6) Events: POST /events → crear, GET /my-events → listar, (7) Friends: GET / → vacío correctamente, (8) Notifications: GET /unread-count → 0, (9) Stories: GET /feed → vacío correctamente.
- **Justificación:** La verificación demuestra integración correcta Controller → Service → Repository → MySQL en todos los dominios de la aplicación.
- **Archivos evidencia:**
  - Logs de servidor y respuestas curl en el historial de desarrollo

---

## Fase 6: Backend — WebSockets y Mensajería en Tiempo Real

### RA PSP — RA3: Programa mecanismos de comunicación en red empleando sockets y analizando el escenario de ejecución

**CE 3.a: Se ha analizado el escenario de ejecución y se ha justificado la selección de la arquitectura de comunicación.**

- **Implementación:** Se selecciona WebSocket sobre STOMP con SockJS como protocolo de transporte para el chat en tiempo real. Se justifica frente a alternativas: HTTP polling (ineficiente, alta latencia), SSE (unidireccional), WebSocket nativo (sin fallback). STOMP proporciona routing de mensajes, suscripciones por tópico, y compatibilidad con el Message Broker de Spring. SockJS añade fallback automático a long-polling para navegadores sin soporte WebSocket.
- **Justificación:** La arquitectura STOMP/WebSocket es full-duplex, asíncrona y escalable. El Message Broker interno de Spring gestiona el routing sin implementación manual. El patrón publish/subscribe permite enviar mensajes punto a punto (/user/{id}/queue/messages).
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/config/WebSocketConfig.java`
  - `/docs/api/websocket-test.md`

**CE 3.b: Se han implementado los roles de cliente y servidor en la comunicación WebSocket.**

- **Implementación:** El servidor Spring Boot actúa como broker STOMP: acepta conexiones en `/ws`, gestiona suscripciones a canales por usuario, y enruta mensajes entre participantes. El `ChatController` recibe mensajes en `/app/chat.sendMessage`, los persiste, y los reenvía al destinatario via `SimpMessagingTemplate.convertAndSendToUser()`. El remitente también recibe confirmación con el ID de base de datos asignado al mensaje.
- **Justificación:** Los roles están claramente separados: el servidor persiste, valida participación, crea notificaciones y enruta; el cliente envía y se suscribe a su canal personal.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/controller/ChatController.java`
  - `/backend/src/main/java/com/eramix/service/ChatService.java`

**CE 3.c: Se ha implementado la comunicación bidireccional y asíncrona sobre socket.**

- **Implementación:** WebSocket STOMP es inherentemente bidireccional: el cliente envía mensajes (SEND) y recibe mensajes (MESSAGE) sobre la misma conexión TCP. La comunicación es asíncrona: el `@MessageMapping` del servidor procesa mensajes en hilos del pool de Spring sin bloquear la conexión. Los mensajes se enrutan al destinatario en tiempo real si está conectado, o se persisten para entrega posterior via API REST.
- **Justificación:** La bidireccionalidad está demostrada por el flujo: enviar mensaje → recibir confirmación + el otro usuario recibe el mensaje, todo sobre la misma conexión.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/controller/ChatController.java`
  - `/docs/api/websocket-test.md`

**CE 3.d: Se han gestionado múltiples clientes concurrentes con control de sesiones.**

- **Implementación:** `WebSocketSessionManager` mantiene un `ConcurrentHashMap<String, Set<String>>` donde la clave es el userId y el valor es el conjunto de sessionIds activos (un usuario puede conectarse desde múltiples dispositivos). Los `@EventListener` de `SessionConnectedEvent` y `SessionDisconnectEvent` registran y limpian sesiones automáticamente, incluyendo desconexiones abruptas. El indicador de presencia (`otherUserOnline`) se expone en las respuestas de conversaciones.
- **Justificación:** `ConcurrentHashMap` garantiza thread-safety en accesos concurrentes. El listener de desconexión garantiza limpieza del mapa incluso con caídas de red. El soporte multi-dispositivo es funcional.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/websocket/WebSocketSessionManager.java`

**CE 3.e: Se ha documentado la arquitectura de comunicación distribuida.**

- **Implementación:** Se documenta el procedimiento completo de prueba del WebSocket en `websocket-test.md`: diagrama de arquitectura (cliente ↔ servidor ↔ cliente), instrucciones de conexión con SockJS, payloads de prueba, respuestas esperadas, y verificación de persistencia via REST. Se incluye ejemplo con JavaScript STOMP client para integración en el frontend.
- **Justificación:** La documentación permite reproducir la prueba de comunicación en tiempo real con herramientas estándar.
- **Archivos evidencia:**
  - `/docs/api/websocket-test.md`
  - `/docs/api/chat-collection.json`

### RA PSP — RA4: Protege las aplicaciones y los datos definiendo y aplicando criterios de seguridad en el acceso

**CE 4.f: Se ha implementado autenticación en la comunicación WebSocket.**

- **Implementación:** `JwtHandshakeInterceptor` intercepta el handshake HTTP/WebSocket, extrae el JWT del query param `?token=`, lo valida con `JwtTokenProvider`, y almacena el userId en los atributos de sesión. Si el token es inválido, expirado o ausente, la conexión se rechaza (el handshake retorna `false`). Un `ChannelInterceptor` en `WebSocketConfig` establece el `Principal` STOMP a partir del userId para habilitar `@SendToUser`.
- **Justificación:** La autenticación WebSocket aplica las mismas reglas de seguridad que la API REST (JWT con expiración), impidiendo acceso no autorizado al sistema de mensajería.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/security/JwtHandshakeInterceptor.java`
  - `/backend/src/main/java/com/eramix/config/WebSocketConfig.java`

### RA Acceso a Datos — RA2: CE 2.f y 2.j: Persistencia transaccional y paginación avanzada

- **Implementación:** `ChatService.saveMessage()` persiste mensajes en transacción con `@Transactional`: guarda el `Message`, actualiza `lastMessageAt` de la `Conversation`, y crea una `Notification` para el destinatario, todo atómicamente. El historial de mensajes usa cursor-based pagination (WHERE id < cursor ORDER BY id DESC LIMIT size) en lugar de offset-based, garantizando consistencia cuando se insertan nuevos mensajes durante la navegación del historial.
- **Justificación:** La transaccionalidad garantiza que un mensaje nunca se persiste sin actualizar la conversación ni sin generar notificación. La paginación por cursor es O(1) vs O(N) del offset para datasets grandes, y es consistente ante inserciones concurrentes.
- **Archivos evidencia:**
  - `/backend/src/main/java/com/eramix/service/ChatService.java`
  - `/backend/src/main/java/com/eramix/repository/MessageRepository.java`
  - `/backend/src/main/java/com/eramix/controller/ConversationController.java`
