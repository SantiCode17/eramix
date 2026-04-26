# 📘 DOCUMENTACIÓN COMPLETA — EraMix

> **Versión:** 1.0.0  
> **Última actualización:** Junio 2025  
> **Autor:** Santiago  
> **Repositorio:** [github.com/SantiCode17/eramix](https://github.com/SantiCode17/eramix)

---

## 📑 Índice

1. [¿Qué es EraMix?](#1-qué-es-eramix)
2. [Arquitectura General](#2-arquitectura-general)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Backend — Spring Boot](#4-backend--spring-boot)
   - [Estructura de Carpetas](#41-estructura-de-carpetas-backend)
   - [Configuración](#42-configuración)
   - [Seguridad y Autenticación (JWT)](#43-seguridad-y-autenticación-jwt)
   - [Base de Datos y Migraciones (Flyway)](#44-base-de-datos-y-migraciones-flyway)
   - [Modelo de Datos — Entidades](#45-modelo-de-datos--entidades)
   - [API REST — Controladores y Endpoints](#46-api-rest--controladores-y-endpoints)
   - [Servicios de Negocio](#47-servicios-de-negocio)
   - [WebSocket — Chat en Tiempo Real](#48-websocket--chat-en-tiempo-real)
   - [Caché (Redis)](#49-caché-redis)
   - [Observabilidad (Actuator + Prometheus)](#410-observabilidad-actuator--prometheus)
5. [Frontend Mobile — React Native + Expo](#5-frontend-mobile--react-native--expo)
   - [Estructura de Carpetas](#51-estructura-de-carpetas-mobile)
   - [Sistema de Diseño (Design System)](#52-sistema-de-diseño-design-system)
   - [Navegación](#53-navegación)
   - [Estado Global (Zustand)](#54-estado-global-zustand)
   - [Capa API (Axios + React Query)](#55-capa-api-axios--react-query)
   - [Hooks Personalizados](#56-hooks-personalizados)
   - [Tipos TypeScript](#57-tipos-typescript)
6. [Pantallas — Documentación Exhaustiva](#6-pantallas--documentación-exhaustiva)
   - [Autenticación](#61-módulo-de-autenticación)
   - [Discover (Inicio)](#62-módulo-discover-inicio)
   - [Eventos](#63-módulo-de-eventos)
   - [Chat y Mensajería](#64-módulo-de-chat-y-mensajería)
   - [Comunidades](#65-módulo-de-comunidades)
   - [Perfil](#66-módulo-de-perfil)
   - [Grupos](#67-módulo-de-grupos)
   - [Globo 3D](#68-módulo-del-globo-3d)
   - [Notificaciones](#69-módulo-de-notificaciones)
   - [Finanzas](#610-módulo-de-finanzas)
   - [Marketplace](#611-módulo-de-marketplace)
   - [Ticketing](#612-módulo-de-ticketing)
   - [Bienestar y SOS](#613-módulo-de-bienestar-y-sos)
   - [Intercambio de Idiomas](#614-módulo-de-intercambio-de-idiomas)
   - [Gamificación](#615-módulo-de-gamificación)
   - [Retos Fotográficos](#616-módulo-de-retos-fotográficos)
   - [Alojamiento](#617-módulo-de-alojamiento)
   - [Guía de Ciudad](#618-módulo-de-guía-de-ciudad)
   - [Asistente IA](#619-módulo-de-asistente-ia)
   - [Ajustes](#620-módulo-de-ajustes)
   - [Stories](#621-módulo-de-stories)
   - [Búsqueda](#622-módulo-de-búsqueda)
   - [OCR — Escáner de Documentos](#623-módulo-ocr--escáner-de-documentos)
   - [GDPR / Privacidad](#624-módulo-gdpr--privacidad)
   - [Acerca de](#625-pantalla-acerca-de)
7. [Infraestructura y DevOps](#7-infraestructura-y-devops)
8. [Enums del Sistema](#8-enums-del-sistema)

---

## 1. ¿Qué es EraMix?

**EraMix** es una plataforma social completa diseñada exclusivamente para **estudiantes de intercambio Erasmus y movilidad internacional**. Actúa como un ecosistema todo-en-uno que acompaña a los estudiantes antes, durante y después de su experiencia Erasmus.

### Propósito

- **Conectar** estudiantes Erasmus entre sí según ubicación, intereses e idiomas.
- **Facilitar** la vida diaria del estudiante: alojamiento, finanzas, eventos, transporte.
- **Gamificar** la experiencia para incentivar la participación e integración cultural.
- **Proteger** al estudiante con herramientas de bienestar, SOS y contactos de emergencia.
- **Asistir** mediante IA para resolver dudas sobre becas, trámites y vida estudiantil.

### Características principales

| Categoría | Funcionalidades |
|---|---|
| **Social** | Discover (swipe), chat 1:1, grupos, comunidades, stories, solicitudes de amistad |
| **Eventos** | Crear, unirse, filtrar por categoría, gestión de participantes |
| **Finanzas** | Registro de gastos, resumen financiero, becas, alertas de presupuesto |
| **Marketplace** | Compraventa entre estudiantes, escrow seguro |
| **Alojamiento** | Búsqueda de pisos/habitaciones, publicación de ofertas |
| **Idiomas** | Intercambio lingüístico, emparejamiento por nivel, sesiones y reseñas |
| **Gamificación** | XP, niveles, logros, leaderboard, retos fotográficos |
| **Bienestar** | Check-ins emocionales, botón SOS, contactos de emergencia |
| **Guía de Ciudad** | Lugares recomendados, reseñas, categorías |
| **Ticketing** | Entradas con QR criptográfico, validación |
| **IA** | Asistente conversacional, agente orquestador multi-herramienta |
| **OCR** | Escáner de documentos con reconocimiento óptico |
| **GDPR** | Gestión de consentimientos, exportación de datos, eliminación de cuenta |
| **Globo 3D** | Visualización interactiva de estudiantes por país |

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     📱 MOBILE (Expo)                        │
│         React Native · TypeScript · Zustand                 │
│               Axios + React Query                           │
│            WebSocket (STOMP) para chat                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST + WS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   🖥️ BACKEND (Spring Boot)                  │
│        Java 21 · Spring Security · JWT · Flyway             │
│     JPA/Hibernate · WebSocket STOMP · LangChain4j           │
└────────────┬──────────────────┬──────────────┬──────────────┘
             │                  │              │
             ▼                  ▼              ▼
      ┌─────────────┐   ┌──────────┐   ┌───────────┐
      │  🗄️ MySQL 8  │   │ 🟥 Redis │   │ 🤖 Claude │
      │   (nativo)   │   │ (Docker) │   │ (Anthropic)│
      └─────────────┘   └──────────┘   └───────────┘
```

### Flujo de datos

1. El usuario interactúa con la app móvil (React Native).
2. Las peticiones REST se envían al backend Spring Boot vía Axios.
3. Los mensajes de chat viajan por WebSocket STOMP en tiempo real.
4. El backend persiste datos en MySQL 8 con migraciones Flyway.
5. Redis actúa como caché distribuida (TTL 10 min).
6. El asistente IA se conecta a Claude (Anthropic) vía LangChain4j.

---

## 3. Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| **Java** | 21 | Lenguaje principal |
| **Spring Boot** | 3.5.0 | Framework web |
| **Spring Security** | (incluido) | Autenticación y autorización |
| **Spring Data JPA** | (incluido) | ORM / Acceso a datos |
| **Spring WebSocket** | (incluido) | Chat en tiempo real (STOMP) |
| **Spring WebFlux** | (incluido) | Llamadas reactivas a APIs externas |
| **Spring Actuator** | (incluido) | Health checks, métricas |
| **Flyway** | (incluido) | Migraciones de base de datos |
| **MySQL** | 8 | Base de datos relacional |
| **Redis** | 7-alpine | Caché distribuida |
| **JJWT** | 0.12.6 | Tokens JWT (auth) |
| **LangChain4j** | 0.36.2 | Orquestación de agentes IA |
| **Anthropic Claude** | claude-sonnet-4 | Modelo de lenguaje |
| **Tess4j** | 5.13.0 | OCR (Tesseract) |
| **JavaCV** | 1.5.10 | Procesamiento de imágenes |
| **Stripe** | 29.2.0 | Pagos y escrow |
| **Micrometer + Prometheus** | (incluido) | Métricas/observabilidad |
| **Lombok** | (incluido) | Reducción de boilerplate |

### Frontend Mobile

| Tecnología | Versión | Propósito |
|---|---|---|
| **React Native** | 0.81.5 | Framework UI nativo |
| **Expo** | 54.0.33 | Toolchain de desarrollo |
| **TypeScript** | 5.9.2 | Tipado estático |
| **Zustand** | 5.0.12 | Estado global |
| **React Query** | 5.95.2 | Cache de datos servidor |
| **Axios** | 1.14.0 | Cliente HTTP |
| **STOMP.js** | 7.3.0 | WebSocket STOMP |
| **React Navigation** | 7.x | Navegación (Stack, Tabs, Drawer) |
| **Expo Linear Gradient** | 15.0.8 | Gradientes |
| **Expo Blur** | 15.0.8 | Efecto blur/glass |
| **Expo Haptics** | 15.0.8 | Retroalimentación háptica |
| **Expo Image Picker** | 17.0.10 | Selección de imágenes |
| **Expo Location** | 19.0.8 | Geolocalización |
| **Expo Notifications** | 0.32.16 | Notificaciones push |
| **Expo Secure Store** | 15.0.8 | Almacenamiento seguro (tokens) |
| **React Native Maps** | 1.20.1 | Mapas interactivos |
| **React Native Reanimated** | 4.1.1 | Animaciones avanzadas |
| **React Native SVG** | 15.12.1 | Gráficos vectoriales |
| **Three.js** | 0.183.2 | Globo 3D interactivo |
| **FlashList** | 2.3.1 | Listas virtualizadas de alto rendimiento |
| **date-fns** | 4.1.0 | Manipulación de fechas |
| **Inter + Space Grotesk** | Expo Fonts | Tipografía |

### Infraestructura

| Tecnología | Propósito |
|---|---|
| **Docker Compose** | Orquestación de servicios |
| **Kubernetes (k8s)** | Manifiestos para producción |
| **Prometheus** | Recolección de métricas |

---

## 4. Backend — Spring Boot

### 4.1. Estructura de Carpetas (Backend)

```
backend/
├── Dockerfile                          # Imagen Docker del backend
├── mvnw                                # Maven wrapper
├── pom.xml                             # Dependencias Maven
├── src/
│   ├── main/
│   │   ├── java/com/eramix/
│   │   │   ├── EramixApplication.java  # Clase principal @SpringBootApplication
│   │   │   ├── config/                 # Configuraciones de Spring
│   │   │   │   ├── CacheConfig.java    # Configuración de Redis Cache
│   │   │   │   ├── CorsConfig.java     # Configuración CORS
│   │   │   │   ├── JpaConfig.java      # Configuración JPA/Hibernate
│   │   │   │   ├── SecurityConfig.java # Filtros de seguridad, rutas públicas
│   │   │   │   ├── WebMvcConfig.java   # Configuración MVC (recursos estáticos)
│   │   │   │   └── WebSocketConfig.java# Configuración STOMP WebSocket
│   │   │   ├── controller/             # 27 controladores REST
│   │   │   ├── dto/                    # Data Transfer Objects (24 subdirectorios)
│   │   │   ├── entity/                 # 68 entidades JPA
│   │   │   │   └── enums/             # 26 enums del dominio
│   │   │   ├── event/                  # Eventos de Spring
│   │   │   ├── exception/              # Excepciones personalizadas
│   │   │   ├── migration/              # Migraciones Java de Flyway
│   │   │   ├── repository/             # Repositorios JPA
│   │   │   ├── security/               # JWT Filter, Provider, Interceptor
│   │   │   ├── service/                # 25 servicios de negocio
│   │   │   ├── util/                   # Utilidades
│   │   │   └── websocket/             # Gestor de sesiones WebSocket
│   │   └── resources/
│   │       ├── application.properties  # Configuración de Spring
│   │       └── db/migration/           # 20 scripts SQL de Flyway
│   └── test/
│       └── java/                       # Tests unitarios
├── target/                             # Build artifacts
└── uploads/
    └── photos/                         # Fotos subidas por usuarios
```

### 4.2. Configuración

El archivo `application.properties` contiene toda la configuración del backend:

| Propiedad | Valor/Variable | Descripción |
|---|---|---|
| `server.port` | `${BACKEND_PORT:8080}` | Puerto del servidor |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/eramix` | URL de MySQL |
| `spring.jpa.hibernate.ddl-auto` | `validate` | Solo valida esquema (Flyway migra) |
| `spring.flyway.enabled` | `true` | Migraciones automáticas |
| `app.jwt.secret` | `${JWT_SECRET:...}` | Clave secreta JWT (256-bit) |
| `app.jwt.expiration-ms` | `900000` (15 min) | Expiración access token |
| `app.jwt.refresh-expiration-ms` | `2592000000` (30 días) | Expiración refresh token |
| `spring.data.redis.host` | `localhost` | Host de Redis |
| `spring.cache.redis.time-to-live` | `600000` (10 min) | TTL de caché Redis |
| `app.ai.anthropic.model` | `claude-sonnet-4-20250514` | Modelo Claude |
| `spring.servlet.multipart.max-file-size` | `10MB` | Tamaño máximo de archivos |
| `management.endpoints.web.exposure.include` | `health,info,prometheus,metrics` | Endpoints de Actuator |

### 4.3. Seguridad y Autenticación (JWT)

El sistema de autenticación se compone de:

**Archivos clave:**
- `SecurityConfig.java` — Define las rutas públicas y protegidas, configura los filtros.
- `JwtTokenProvider.java` — Genera y valida access tokens y refresh tokens con JJWT.
- `JwtAuthenticationFilter.java` — Filtro que intercepta cada request y valida el token JWT en la cabecera `Authorization: Bearer <token>`.
- `JwtHandshakeInterceptor.java` — Interceptor para autenticar conexiones WebSocket.

**Flujo de autenticación:**

1. **Registro** → `POST /api/v1/auth/register` — Crea usuario con BCrypt hash, devuelve `accessToken` + `refreshToken`.
2. **Login** → `POST /api/v1/auth/login` — Valida credenciales, devuelve tokens.
3. **Refresh** → `POST /api/v1/auth/refresh` — Usa el refreshToken para obtener un nuevo accessToken.
4. **Peticiones protegidas** → El filtro `JwtAuthenticationFilter` extrae el userId del token y lo inyecta como `Authentication.principal`.
5. **Logout** → `POST /api/v1/auth/logout` — Invalida el refreshToken.

**Rutas públicas (sin token):**
- `/api/health`
- `/api/v1/auth/**`
- `/api/v1/catalog/**`
- `/uploads/**`
- `/ws/**` (WebSocket)
- Endpoints de Actuator (`/actuator/**`)

### 4.4. Base de Datos y Migraciones (Flyway)

EraMix usa **20 migraciones Flyway** que construyen el esquema de forma incremental:

| Migración | Descripción |
|---|---|
| `V1__create_schema.sql` | Esquema base: users, universities, interests, languages, conversations, messages, friends, notifications, events, stories |
| `V2__seed_data.sql` | Datos iniciales: universidades, intereses, idiomas |
| `V4__create_groups_communities.sql` | Grupos de chat, comunidades con posts/likes/comentarios |
| `V5__create_language_exchange.sql` | Intercambio de idiomas: requests, sessions, reviews |
| `V6__create_gamification.sql` | XP, niveles, logros, leaderboard |
| `V7__create_photo_challenges.sql` | Retos fotográficos: challenges, submissions, votes |
| `V8__create_roommate_finder.sql` | Búsqueda de compañeros de piso |
| `V9__create_city_guide.sql` | Guía de ciudad: places, reviews, campus buildings |
| `V10__extend_multimedia_chat.sql` | Chat multimedia: imágenes, audio, video |
| `V11__create_ai_assistant.sql` | Conversaciones IA: conversations, messages |
| `V12__create_multiagent_tables.sql` | Sistema multi-agente: sessions, execution traces, vector documents |
| `V13__create_ocr_tables.sql` | OCR: optical records, extracted entities |
| `V14__create_ewp_tables.sql` | Erasmus Without Paper: acuerdos inter-institucionales, learning agreements |
| `V15__create_ar_tables.sql` | Tablas de realidad aumentada |
| `V16__create_financial_tables.sql` | Finanzas: transacciones, categorías, becas, alertas |
| `V17__create_marketplace_tables.sql` | Marketplace: listings, fotos, categorías, escrow |
| `V18__create_ticketing_tables.sql` | Ticketing: listings, tickets criptográficos, redemptions |
| `V19__create_wellbeing_tables.sql` | Bienestar: check-ins, contactos de emergencia, SOS |
| `V20__create_gdpr_tables.sql` | GDPR: consentimientos, auditoría |
| `V21__seed_test_user.sql` | Usuario de prueba: `test@eramix.eu` / `Test1234!` |

### 4.5. Modelo de Datos — Entidades

EraMix tiene **68 entidades JPA**. Las principales son:

#### Entidades de Usuario y Social

| Entidad | Descripción |
|---|---|
| `User` | Usuario principal. Campos: email, passwordHash, firstName, lastName, profilePhotoUrl, dateOfBirth, bio, homeUniversity, hostUniversity, destinationCity, destinationCountry, mobilityStart, mobilityEnd, latitude, longitude, isActive, isVerified, lastSeen. Relaciones: interests (ManyToMany), userLanguages (OneToMany), photos (OneToMany). |
| `UserPhoto` | Foto adicional del usuario. Campos: url, displayOrder. |
| `UserLanguage` | Idioma del usuario con nivel de competencia (ProficiencyLevel). |
| `Interest` | Catálogo de intereses (ej: "Viajes", "Música", "Deportes"). |
| `Language` | Catálogo de idiomas (ej: "Español", "English", "Deutsch"). |
| `University` | Universidad. Campos: name, city, country, latitude, longitude. |
| `Friendship` | Relación de amistad entre dos usuarios. |
| `FriendRequest` | Solicitud de amistad con estado (PENDING, ACCEPTED, REJECTED, BLOCKED). |

#### Entidades de Mensajería

| Entidad | Descripción |
|---|---|
| `Conversation` | Conversación 1:1 entre dos usuarios. |
| `Message` | Mensaje dentro de una conversación. Campos: content, messageType, senderId, readAt. |
| `ChatGroup` | Grupo de chat. Campos: name, description, createdBy, avatarUrl. |
| `GroupMember` | Miembro de un grupo con rol (ADMIN, MEMBER). |
| `GroupMessage` | Mensaje dentro de un grupo. |

#### Entidades de Comunidades

| Entidad | Descripción |
|---|---|
| `Community` | Comunidad temática. Campos: name, description, category, avatarUrl, isPublic, memberCount. |
| `CommunityMember` | Miembro de una comunidad con rol (ADMIN, MODERATOR, MEMBER) y estado (ACTIVE, BANNED). |
| `CommunityPost` | Post dentro de una comunidad. Campos: content, imageUrl, likeCount, commentCount. |
| `CommunityPostLike` | Like a un post. |
| `CommunityComment` | Comentario en un post. |

#### Entidades de Eventos

| Entidad | Descripción |
|---|---|
| `Event` | Evento. Campos: title, description, category, location, latitude, longitude, startDate, endDate, maxParticipants, isPublic, imageUrl, createdBy. |
| `EventParticipant` | Participante de un evento con estado (GOING, INTERESTED, NOT_GOING). |

#### Entidades de Stories

| Entidad | Descripción |
|---|---|
| `Story` | Historia efímera (24h). Campos: mediaUrl, caption, expiresAt, viewCount. |
| `StoryView` | Registro de visualización de una story. |

#### Entidades Financieras

| Entidad | Descripción |
|---|---|
| `LedgerTransaction` | Transacción financiera. Campos: amount, description, category, transactionDate, type (INCOME/EXPENSE). |
| `SpendingCategory` | Categoría de gasto con icono y color. |
| `GrantAllocation` | Beca/subvención. Campos: name, totalAmount, disbursedAmount, remainingAmount. |
| `BudgetAlert` | Alerta de presupuesto. Campos: message, type, isAcknowledged. |

#### Entidades de Marketplace

| Entidad | Descripción |
|---|---|
| `MarketplaceListing` | Anuncio de venta. Campos: title, description, price, currency, condition, city, isActive. |
| `MarketplacePhoto` | Foto de un producto. |
| `ListingCategory` | Categoría de producto con icono. |
| `EscrowTransaction` | Transacción escrow segura entre comprador y vendedor. |

#### Entidades de Ticketing

| Entidad | Descripción |
|---|---|
| `TicketListing` | Evento/entrada disponible. Campos: eventName, venue, date, price, totalTickets, remainingTickets. |
| `CryptographicTicket` | Ticket con UUID único y firma criptográfica para QR. |
| `TicketRedemption` | Registro de uso/validación de un ticket. |

#### Entidades de Bienestar

| Entidad | Descripción |
|---|---|
| `WellbeingCheckin` | Check-in emocional. Campos: mood (1-5), notes, date. |
| `EmergencyContact` | Contacto de emergencia. Campos: name, phone, relationship. |
| `EmergencyResource` | Recurso de emergencia local (hospitales, policía, etc.). |
| `SOSActivation` | Registro de activación del botón SOS. |

#### Entidades de Intercambio de Idiomas

| Entidad | Descripción |
|---|---|
| `LanguageExchangeRequest` | Solicitud de intercambio. Campos: offeredLanguage, wantedLanguage, status. |
| `ExchangeSession` | Sesión programada de intercambio. Campos: scheduledAt, duration, status. |
| `ExchangeReview` | Valoración de una sesión. Campos: rating, comment. |
| `ExchangeRateCache` | Caché de tasas de cambio de divisas. |

#### Entidades de Gamificación

| Entidad | Descripción |
|---|---|
| `UserLevel` | Nivel del usuario. Campos: currentXp, level, totalXp. |
| `XpTransaction` | Transacción de XP. Campos: amount, source, description. |
| `Achievement` | Logro disponible. Campos: name, description, iconUrl, category, xpReward, criteria. |
| `UserAchievement` | Logro desbloqueado por un usuario. |

#### Entidades de Retos

| Entidad | Descripción |
|---|---|
| `ErasmusChallenge` | Reto fotográfico. Campos: title, description, theme, startDate, endDate, xpReward. |
| `ChallengeSubmission` | Envío de foto a un reto. |
| `ChallengeVote` | Voto a un envío. |

#### Entidades de Alojamiento

| Entidad | Descripción |
|---|---|
| `HousingPost` | Publicación de alojamiento. Campos: title, description, type (ROOM/APARTMENT/STUDIO), price, city, address, isActive. |
| `RoommatePreference` | Preferencias de compañero de piso. |

#### Entidades de Ciudad

| Entidad | Descripción |
|---|---|
| `Place` | Lugar de interés. Campos: name, description, category, address, city, latitude, longitude, rating, reviewCount. |
| `PlaceReview` | Reseña de un lugar. Campos: rating, comment. |
| `CampusBuilding` | Edificio universitario. |

#### Entidades de IA

| Entidad | Descripción |
|---|---|
| `AiConversation` | Conversación con el asistente IA. |
| `AiMessage` | Mensaje en conversación IA. Campos: role (USER/ASSISTANT), content. |
| `AgentSession` | Sesión del agente orquestador. |
| `ExecutionTrace` | Traza de ejecución del agente. |
| `VectorDocument` | Documento vectorizado para RAG. |
| `ExtractedEntity` | Entidad extraída por OCR. |

#### Entidades de GDPR

| Entidad | Descripción |
|---|---|
| `UserConsent` | Consentimiento del usuario. Campos: consentType, granted, grantedAt. |
| `ConsentAuditLog` | Auditoría de cambios de consentimiento. |

#### Otras Entidades

| Entidad | Descripción |
|---|---|
| `Notification` | Notificación del sistema. Campos: type, title, message, isRead, referenceId. |
| `RefreshToken` | Token de refresco para sesiones. |
| `OpticalRecord` | Registro de escaneo OCR. |
| `InterInstitutionalAgreement` | Acuerdo inter-institucional (EWP). |
| `LearningAgreementStatus` | Estado del Learning Agreement. |
| `BaseEntity` | Clase base con id, createdAt, updatedAt. |

### 4.6. API REST — Controladores y Endpoints

EraMix expone **27 controladores** con más de **120 endpoints REST**:

---

#### 🔑 AuthController — `/api/v1/auth`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/register` | Registrar nuevo usuario. Body: `{email, password, firstName, lastName}`. Respuesta: `{accessToken, refreshToken, user}` |
| `POST` | `/login` | Iniciar sesión. Body: `{email, password}`. Respuesta: `{accessToken, refreshToken, user}` |
| `POST` | `/refresh` | Renovar tokens. Body: `{refreshToken}`. Respuesta: `{accessToken, refreshToken}` |
| `POST` | `/logout` | Cerrar sesión. Body: `{refreshToken}`. Invalida el refresh token. |
| `POST` | `/forgot-password` | Solicitar reset. Body: `{email}`. Respuesta: `{token}` (dev), email (prod). |
| `POST` | `/reset-password` | Resetear contraseña. Body: `{token, newPassword}`. |
| `DELETE` | `/account` | Eliminar cuenta permanentemente. Body: `{password}`. Requiere autenticación. |

---

#### 👤 UserController — `/api/v1/users`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/me` | Obtener mi perfil completo (con universidades, intereses, idiomas, fotos). |
| `GET` | `/{id}` | Obtener perfil público de otro usuario. |
| `PUT` | `/me` | Actualizar mi perfil. Body: `{firstName, lastName, bio, dateOfBirth, destinationCity, ...}` |
| `PUT` | `/me/photo` | Subir/cambiar foto de perfil. Multipart: `file`. |
| `POST` | `/me/photos` | Añadir foto adicional. Multipart: `file`, `displayOrder`. |
| `DELETE` | `/me/photos/{photoId}` | Eliminar una foto. |
| `GET` | `/me/photos` | Listar mis fotos. |
| `PUT` | `/me/location` | Actualizar geolocalización. Body: `{latitude, longitude}`. |

---

#### 🤝 FriendController — `/api/v1/friends`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/requests` | Enviar solicitud de amistad. Body: `{receiverId}`. |
| `GET` | `/requests/received` | Solicitudes recibidas pendientes. |
| `GET` | `/requests/sent` | Solicitudes enviadas. |
| `PUT` | `/requests/{id}` | Aceptar/Rechazar solicitud. Body: `{action: "ACCEPT"/"REJECT"}`. |
| `DELETE` | `/requests/{id}` | Cancelar solicitud enviada. |
| `GET` | `/` | Listar mis amigos. |
| `DELETE` | `/{friendId}` | Eliminar amistad. |
| `POST` | `/block/{blockedId}` | Bloquear usuario. |
| `DELETE` | `/block/{blockedId}` | Desbloquear usuario. |
| `GET` | `/blocked` | Listar usuarios bloqueados. |

---

#### 💬 ConversationController — `/api/v1/conversations`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Listar todas mis conversaciones (con último mensaje y unread count). |
| `GET` | `/{id}` | Detalle de una conversación. |
| `GET` | `/{id}/messages` | Mensajes de una conversación (paginación por cursor). Params: `cursor`, `size`. |
| `PUT` | `/{id}/read` | Marcar todos los mensajes como leídos. |

---

#### 📡 ChatController — WebSocket STOMP

| Destino | Descripción |
|---|---|
| `/app/chat.sendMessage` | Enviar mensaje DM. Payload: `{conversationId, content, messageType}`. Se entrega a `/user/{userId}/queue/messages`. |
| `/app/chat.typing` | Indicador de escritura. Payload: `{conversationId, typing: boolean}`. Se reenvía a `/user/{userId}/queue/typing`. |
| `/app/group.sendMessage` | Enviar mensaje a grupo. Payload: `{groupId, content}`. Se broadcast a `/topic/group/{groupId}`. |
| `/app/group.typing` | Indicador de escritura en grupo. Se broadcast a `/topic/group/{groupId}/typing`. |

---

#### 📅 EventController — `/api/v1/events`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/` | Crear evento. Body: `{title, description, category, location, startDate, endDate, maxParticipants, isPublic}`. |
| `GET` | `/{id}` | Detalle de evento. |
| `PUT` | `/{id}` | Actualizar evento (solo creador). |
| `DELETE` | `/{id}` | Eliminar evento (solo creador). |
| `POST` | `/{id}/join` | Unirse al evento. Body: `{status: "GOING"/"INTERESTED"}`. |
| `DELETE` | `/{id}/leave` | Salir del evento. |
| `GET` | `/{id}/participants` | Lista de participantes. |
| `GET` | `/upcoming` | Eventos próximos. Params: `category`, `page`, `size`. |
| `GET` | `/my-events` | Mis eventos creados. |
| `GET` | `/joined` | Eventos en los que participo. |

---

#### 🏘️ CommunityController — `/api/v1/communities`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Listar comunidades. Params: `category`, `q` (búsqueda). |
| `GET` | `/my` | Mis comunidades. |
| `GET` | `/suggested` | Comunidades sugeridas. |
| `GET` | `/{id}` | Detalle de comunidad. |
| `POST` | `/{id}/join` | Unirse a la comunidad. |
| `DELETE` | `/{id}/leave` | Salir de la comunidad. |
| `GET` | `/{id}/posts` | Posts de la comunidad (paginados). |
| `POST` | `/{id}/posts` | Crear post. Body: `{content, imageUrl}`. |
| `POST` | `/{id}/posts/{postId}/like` | Like/Unlike a un post (toggle). |
| `POST` | `/{id}/posts/{postId}/comments` | Comentar en un post. Body: `{content}`. |

---

#### 👥 GroupController — `/api/v1/groups`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/` | Crear grupo. Body: `{name, description}`. |
| `GET` | `/my` | Mis grupos. |
| `GET` | `/{id}` | Detalle del grupo. |
| `POST` | `/{id}/members` | Añadir miembros. Body: `[userId1, userId2]`. |
| `DELETE` | `/{id}/members/{userId}` | Eliminar miembro (admin). |
| `DELETE` | `/{id}/leave` | Salir del grupo. |
| `GET` | `/{id}/messages` | Mensajes del grupo (paginados). |
| `PUT` | `/{id}/read` | Marcar mensajes como leídos. |

---

#### 💰 FinancialController — `/api/v1/finance`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/transactions` | Crear transacción. Body: `{amount, description, categoryId, type}`. |
| `GET` | `/transactions` | Listar transacciones. Params: `startDate`, `endDate`. |
| `GET` | `/summary` | Resumen financiero (ingresos, gastos, balance). |
| `GET` | `/grants` | Listar becas/subvenciones. |
| `PUT` | `/alerts/{id}/acknowledge` | Marcar alerta como vista. |
| `GET` | `/categories` | Categorías de gasto. |

---

#### 🛒 MarketplaceController — `/api/v1/marketplace`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/listings` | Crear anuncio. Body: `{title, description, price, currency, condition, categoryId, city}`. |
| `GET` | `/listings` | Listar anuncios. Params: `city`, `page`, `size`. |
| `GET` | `/listings/{id}` | Detalle de anuncio. |
| `GET` | `/my-listings` | Mis anuncios. |
| `DELETE` | `/listings/{id}` | Desactivar anuncio. |
| `POST` | `/escrow` | Iniciar transacción escrow. Body: `{listingId, buyerPrice}`. |
| `PUT` | `/escrow/{id}/confirm` | Confirmar encuentro. Param: `role`. |
| `PUT` | `/escrow/{id}/complete` | Completar escrow. |
| `GET` | `/escrow` | Mis transacciones escrow. |

---

#### 🎫 TicketingController — `/api/v1/tickets`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/listings` | Entradas disponibles. |
| `POST` | `/purchase/{ticketListingId}` | Comprar entrada. Genera ticket criptográfico. |
| `GET` | `/my-tickets` | Mis entradas compradas. |
| `GET` | `/qr/{ticketUuid}` | Generar payload QR para un ticket. |
| `POST` | `/validate` | Validar ticket escaneado. Body: `{qrPayload}`. |

---

#### ❤️ WellbeingController — `/api/v1/wellbeing`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/checkin` | Crear check-in emocional. Body: `{mood, notes}`. |
| `GET` | `/checkins` | Historial de check-ins. |
| `GET` | `/summary` | Resumen de bienestar. Param: `countryCode`. |
| `POST` | `/sos` | Activar botón SOS. Body: `{latitude, longitude, message}`. |
| `POST` | `/emergency-contacts` | Añadir contacto de emergencia. Body: `{name, phone, relationship}`. |
| `GET` | `/emergency-contacts` | Listar contactos de emergencia. |
| `DELETE` | `/emergency-contacts/{id}` | Eliminar contacto. |

---

#### 🔄 LanguageExchangeController — `/api/v1/exchange`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/partners` | Buscar partners compatibles. |
| `POST` | `/requests` | Enviar solicitud de intercambio. Body: `{receiverId, offeredLanguageId, wantedLanguageId, message}`. |
| `GET` | `/requests/received` | Solicitudes recibidas. |
| `GET` | `/requests/sent` | Solicitudes enviadas. |
| `PUT` | `/requests/{id}/accept` | Aceptar solicitud. |
| `PUT` | `/requests/{id}/reject` | Rechazar solicitud. |
| `POST` | `/sessions` | Agendar sesión. Body: `{partnerId, scheduledAt, duration}`. |
| `GET` | `/sessions` | Mis sesiones. |
| `PUT` | `/sessions/{id}/complete` | Completar sesión. |
| `PUT` | `/sessions/{id}/cancel` | Cancelar sesión. |
| `POST` | `/reviews` | Crear valoración. Body: `{sessionId, rating, comment}`. |
| `GET` | `/reviews/{userId}` | Valoraciones de un usuario. |

---

#### 🏆 GamificationController — `/api/v1/gamification`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/progress` | Mi progreso (XP, nivel, siguiente nivel). |
| `GET` | `/achievements` | Lista de logros (desbloqueados y pendientes). |
| `GET` | `/leaderboard` | Clasificación global. Param: `limit`. |

---

#### ⚡ ChallengeController — `/api/v1/challenges`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/` | Crear reto fotográfico. Body: `{title, description, theme, xpReward, endDate}`. |
| `GET` | `/` | Listar retos activos. |
| `POST` | `/{challengeId}/submissions` | Enviar foto al reto. Body: `{photoUrl, caption}`. |
| `GET` | `/{challengeId}/submissions` | Ver envíos de un reto. |
| `POST` | `/submissions/{submissionId}/vote` | Votar un envío. |

---

#### 🏠 HousingController — `/api/v1/housing`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/` | Crear publicación de alojamiento. Body: `{title, description, type, price, city, address}`. |
| `GET` | `/` | Listar alojamientos. Param: `city`. |
| `GET` | `/mine` | Mis publicaciones. |
| `DELETE` | `/{postId}` | Desactivar publicación. |

---

#### 🗺️ CityGuideController — `/api/v1/city-guide`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/places` | Listar lugares. Params: `city`, `category`. |
| `GET` | `/places/{id}` | Detalle de un lugar. |
| `POST` | `/places` | Crear lugar. Body: `{name, description, category, address, city, latitude, longitude}`. |
| `GET` | `/places/{placeId}/reviews` | Reseñas de un lugar. |
| `POST` | `/places/{placeId}/reviews` | Añadir reseña. Body: `{rating, comment}`. |

---

#### 🌐 GlobeController — `/api/v1/globe`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/stats` | Estadísticas por país para el globo 3D (total estudiantes, universidades). |

---

#### 🤖 AiAssistantController — `/api/v1/ai`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/conversations` | Listar conversaciones con IA. |
| `GET` | `/conversations/{id}` | Detalle de conversación IA. |
| `POST` | `/chat` | Enviar mensaje al asistente IA. Body: `{message, conversationId?}`. Respuesta: conversación con respuesta del asistente. |
| `DELETE` | `/conversations/{id}` | Eliminar conversación. |

---

#### 🕵️ AgentController — `/api/v1/agent`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/chat` | Interactuar con el agente orquestador multi-herramienta. Body: `{message, sessionId?}`. |

---

#### 🔔 NotificationController — `/api/v1/notifications`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Listar notificaciones (paginadas). Params: `page`, `size`. |
| `GET` | `/unread-count` | Cantidad de no leídas. |
| `PUT` | `/{id}/read` | Marcar una como leída. |
| `PUT` | `/read-all` | Marcar todas como leídas. |
| `DELETE` | `/{id}` | Eliminar notificación. |

---

#### 🔍 SearchController — `/api/v1/search`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/` | Búsqueda combinada con filtros. Body: `{query, interests, languages, city, country, page, size}`. |
| `GET` | `/nearby` | Usuarios cercanos (Haversine). Params: `latitude`, `longitude`, `radiusKm`. |
| `GET` | `/by-city` | Usuarios por ciudad. Param: `city`. |
| `GET` | `/by-country` | Usuarios por país. Param: `country`. |

---

#### 📋 CatalogController — `/api/v1/catalog`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/interests` | Todos los intereses del catálogo. |
| `GET` | `/languages` | Todos los idiomas. |
| `GET` | `/universities` | Todas las universidades. |
| `GET` | `/universities/search` | Buscar universidad por nombre. Param: `query`. |

---

#### 📸 OcrController — `/api/v1/ocr`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/scan` | Escanear imagen OCR. Body: `{imageBase64, documentType}`. Respuesta: texto extraído + entidades. |
| `GET` | `/scans` | Historial de escaneos. |

---

#### 🛡️ GdprController — `/api/v1/privacy`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/consents` | Estado de consentimientos GDPR. |
| `PUT` | `/consents` | Actualizar consentimientos. Body: `{analytics, marketing, thirdParty}`. |
| `POST` | `/data-export` | Solicitar exportación de datos personales. |
| `DELETE` | `/account` | Solicitar eliminación de cuenta (30 días de gracia). |

---

#### ❤️‍🩹 HealthController — `/api/health`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check. Respuesta: `{status: "UP", application: "EraMix", timestamp}`. |

---

### 4.7. Servicios de Negocio

EraMix tiene **25 servicios** que encapsulan la lógica de negocio:

| Servicio | Responsabilidad |
|---|---|
| `AuthService` | Registro, login, refresh tokens, forgot/reset password, delete account. Hasheo BCrypt. |
| `UserService` | CRUD de perfil, fotos, ubicación, intereses, idiomas. |
| `ChatService` | Persistir mensajes, obtener conversaciones, marcar como leídos, cursor-based pagination. |
| `GroupService` | CRUD de grupos, envío de mensajes de grupo, gestión de miembros. |
| `CommunityService` | CRUD de comunidades, posts, likes, comentarios, sugerencias. |
| `EventService` | CRUD de eventos, join/leave, participantes, filtrado por categoría. |
| `FriendService` | Solicitudes de amistad, aceptar/rechazar, bloqueo/desbloqueo. |
| `StoryService` | Crear/eliminar stories, feed de stories, registro de vistas. |
| `FinancialService` | Transacciones, resumen, becas, alertas, categorías. |
| `MarketplaceService` | CRUD de listings, escrow (initiate, confirm, complete). |
| `TicketingService` | Listings, compra, generación QR criptográfico, validación. |
| `WellbeingService` | Check-ins emocionales, SOS, contactos de emergencia. |
| `LanguageExchangeService` | Partners, requests, sessions, reviews. |
| `GamificationService` | XP, niveles, logros, leaderboard. |
| `ChallengeService` | Retos fotográficos, submissions, votación. |
| `HousingService` | CRUD de alojamientos. |
| `CityGuideService` | Lugares, reviews, categorías. |
| `GlobeService` | Estadísticas por país para el globo 3D. |
| `SearchService` | Búsqueda combinada, nearby (Haversine), por ciudad/país. |
| `NotificationService` | CRUD de notificaciones, contar no leídas, marcar. |
| `AiAssistantService` | Chat con Claude (Anthropic), gestión de conversaciones IA. |
| `AgentOrchestratorService` | Agente multi-herramienta con LangChain4j. |
| `OcrService` | Procesamiento de imágenes con Tesseract, extracción de entidades. |
| `GdprService` | Consentimientos, exportación de datos, eliminación de cuenta GDPR. |
| `FileStorageService` | Almacenamiento de archivos (fotos) en disco local. |

### 4.8. WebSocket — Chat en Tiempo Real

El chat usa **STOMP sobre WebSocket** configurado en `WebSocketConfig.java`:

- **Endpoint de conexión:** `/ws` (con SockJS fallback)
- **Prefijo de aplicación:** `/app` (para enviar mensajes)
- **Prefijo de broker:**
  - `/topic` — Para suscripciones broadcast (grupos)
  - `/user` — Para mensajes personales (DM)

**Flujo de un mensaje directo (DM):**

```
📱 Cliente A                    🖥️ Servidor                    📱 Cliente B
    │                              │                              │
    ├── SEND /app/chat.sendMessage ──►│                              │
    │     {conversationId, content}│                              │
    │                              ├── Persistir en MySQL         │
    │                              ├── SEND /user/B/queue/messages ──►│
    │                              ├── SEND /user/A/queue/messages ──►│ (confirmación)
```

**Flujo de un mensaje de grupo:**

```
📱 Cliente A                    🖥️ Servidor                    📱 Clientes B,C,D
    │                              │                              │
    ├── SEND /app/group.sendMessage──►│                              │
    │     {groupId, content}       │                              │
    │                              ├── Persistir en MySQL         │
    │                              ├── SEND /topic/group/{id} ────────►│ (broadcast)
    │                              ├── SEND /user/{B,C,D}/queue/group-messages ──►│
```

**Autenticación WebSocket:**
- `JwtHandshakeInterceptor` intercepta el handshake HTTP y valida el token JWT.
- `WebSocketSessionManager` gestiona las sesiones activas.

### 4.9. Caché (Redis)

- **Redis 7 Alpine** corre en Docker.
- Spring Cache con Redis como backend.
- **TTL:** 10 minutos (600000 ms).
- Se usa para cachear consultas frecuentes (catálogos, leaderboard, estadísticas del globo).

### 4.10. Observabilidad (Actuator + Prometheus)

- **Endpoints expuestos:** `/actuator/health`, `/actuator/info`, `/actuator/prometheus`, `/actuator/metrics`.
- **Micrometer** exporta métricas en formato Prometheus.
- **Health checks** configurados para MySQL, Redis.
- Tag de aplicación: `eramix`.

---

## 5. Frontend Mobile — React Native + Expo

### 5.1. Estructura de Carpetas (Mobile)

```
mobile/
├── App.tsx                     # Entry point con providers
├── app.json                    # Configuración de Expo
├── eas.json                    # Configuración de EAS Build
├── package.json                # Dependencias
├── tsconfig.json               # Configuración TypeScript
├── babel.config.js             # Configuración Babel (alias @/)
├── index.ts                    # Registro de la app
├── assets/
│   ├── fonts/                  # Fuentes personalizadas
│   ├── images/                 # Imágenes estáticas
│   └── textures/               # Texturas (globo 3D)
└── src/
    ├── api/                    # 25 servicios API (Axios)
    ├── assets/images/          # Imágenes de la app
    ├── components/             # Componentes globales (Globe3D, InteractiveGlobe)
    ├── config/
    │   ├── env.ts              # Variables de entorno (API_BASE_URL)
    │   └── networkManager.ts   # Gestión de red
    ├── constants/
    │   ├── index.ts            # Constantes generales
    │   └── theme.ts            # Tema completo (EramixColors, Typography, etc.)
    ├── design-system/
    │   ├── index.ts            # Barrel export
    │   ├── tokens.ts           # Tokens de diseño (DS, colors, typography, spacing)
    │   ├── fonts.ts            # Carga de fuentes
    │   ├── animations/         # 9 hooks de animación
    │   └── components/         # 25 componentes del design system
    ├── hooks/                  # 7 hooks personalizados
    ├── navigation/             # 20 navegadores
    ├── screens/                # 25+ módulos de pantallas
    ├── services/               # Servicios auxiliares
    ├── store/                  # 13 stores Zustand
    ├── types/                  # 24+ archivos de tipos
    └── utils/                  # Utilidades (resolveMediaUrl, etc.)
```

### 5.2. Sistema de Diseño (Design System)

EraMix utiliza un **sistema de diseño europeo glassmorphism** con estética premium de vidrio esmerilado.

#### Tokens de Diseño (`tokens.ts`)

**Colores principales:**

| Token | Valor | Uso |
|---|---|---|
| `NAVY_DEEP` / `DS.background` | `#0A1628` | Fondo de la aplicación |
| `NAVY_CARD` / `DS.surface` | `#132240` | Superficie de tarjetas |
| `NAVY_SURFACE` | `#1A2D4D` | Superficie elevada |
| `PRIMARY_GOLD` / `colors.eu.star` | `#FFD700` | Color de acento principal (oro EU) |
| `PRIMARY_ORANGE` | `#FF6D3F` | Color secundario (gradientes) |
| `TEXT_PRIMARY` | `#FFFFFF` | Texto principal |
| `TEXT_SECONDARY` | `#8FA3BC` | Texto secundario |
| `TEXT_MUTED` | `#5A6F8A` | Texto terciario |
| `ERROR_RED` | `#E53E3E` | Errores |
| `SUCCESS_GREEN` | `#38A169` | Éxito |

**Colores glass:**

| Token | Valor | Uso |
|---|---|---|
| `glass.white` | `rgba(255,255,255,0.08)` | Fondo glass suave |
| `glass.whiteMid` | `rgba(255,255,255,0.14)` | Fondo glass medio |
| `glass.whiteStrong` | `rgba(255,255,255,0.22)` | Fondo glass fuerte |
| `glass.border` | `rgba(255,255,255,0.10)` | Borde glass |

**Tipografía:**

| Familia | Fuente | Uso |
|---|---|---|
| `heading` | Space Grotesk Bold | Títulos principales |
| `subheading` | Space Grotesk SemiBold | Subtítulos |
| `bodyMedium` | Inter Medium | Texto con énfasis |
| `body` | Inter Regular | Texto general |
| `caption` | Inter Regular | Texto pequeño |
| `mono` | Courier New (fallback) | Código |

**Spacing:** `xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48`

**Radii:** `xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999`

#### Componentes del Design System (25 componentes)

| Componente | Descripción |
|---|---|
| `ScreenBackground` | Fondo degradado de todas las pantallas (navy deep → navy card). |
| `Header` | Cabecera con botón de menú/back, título y acciones opcionales. |
| `GradientHeader` | Cabecera con gradiente gold-orange. |
| `GlassCard` | Tarjeta con efecto glassmorphism (borde sutil, fondo semi-transparente). |
| `GlassButton` | Botón con variantes: `primary` (gradiente gold→orange), `secondary`, `outline`, `ghost`, `danger`. |
| `GlassInput` | Campo de texto con fondo glass, placeholder translúcido, borde animado en focus. |
| `GlassModal` | Modal con backdrop blur y contenido glass. |
| `GlassMetricCard` | Tarjeta de métrica con icono, valor y label. |
| `Avatar` | Avatar circular con imagen o iniciales. Soporta indicador de estado online/offline. |
| `Badge` | Insignia numérica (ej: contador de notificaciones). |
| `Chip` | Chip seleccionable con estados active/inactive. Color gold cuando activo. |
| `Tag` | Etiqueta de categoría con colores. |
| `Divider` | Separador horizontal con opacidad glass. |
| `LoadingSpinner` | Spinner de carga animado con color gold. |
| `EmptyState` | Estado vacío con icono, título y mensaje. |
| `ErrorState` | Estado de error con botón de reintentar. |
| `TabBar` | Barra de tabs secundaria (dentro de pantallas). |
| `FloatingActionButton` | Botón flotante circular con gradiente. |
| `SectionHeader` | Título de sección con acción opcional "Ver más". |
| `StatusPill` | Pill indicador de estado (colores por tipo). |
| `AnimatedBottomSheet` | Bottom sheet con gesto de arrastre y animación fluida. |
| `QuickActionGrid` | Grid de acciones rápidas (icono + label). |
| `ProgressRing` | Anillo de progreso circular (SVG). |
| `NetworkStatusBanner` | Banner que aparece cuando se pierde la conexión. |
| `AppImage` | Componente de imagen que resuelve URLs con `resolveMediaUrl`. |

#### Hooks de Animación (9 hooks)

| Hook | Descripción |
|---|---|
| `useFadeIn` | Animación de aparición con opacidad. |
| `useSlideUp` | Deslizamiento desde abajo. |
| `useScalePress` | Escala al presionar (micro-interacción). |
| `useStaggeredList` | Lista con aparición escalonada de elementos. |
| `useShimmer` | Efecto shimmer/skeleton para carga. |
| `usePulse` | Pulsación continua (indicadores). |
| `useLiquidGlass` | Efecto liquid glass avanzado. |
| `useBreathingGlow` | Brillo suave de respiración. |
| `useBouncePress` | Rebote al presionar. |

### 5.3. Navegación

EraMix usa **React Navigation 7** con tres niveles de navegación:

```
RootNavigator (Stack)
├── Auth (no autenticado)
│   └── AuthNavigator (Stack)
│       ├── Splash
│       ├── Onboarding
│       ├── Login
│       ├── Register
│       ├── ForgotPassword
│       └── ResetPassword
│
└── Main (autenticado)
    └── MainNavigator (Drawer)
        ├── HomeTabs (BottomTabNavigator)
        │   ├── Discover → DiscoverNavigator (Stack)
        │   │   ├── DiscoverMain
        │   │   ├── NearbyMap
        │   │   ├── FriendRequests
        │   │   └── UserDetail
        │   ├── Events → EventsNavigator (Stack)
        │   │   ├── EventsList
        │   │   ├── EventDetail
        │   │   └── CreateEvent (modal)
        │   ├── Chat → ChatNavigator (Stack)
        │   │   ├── ConversationsList
        │   │   └── ChatRoom
        │   ├── Communities → CommunitiesNavigator (Stack)
        │   │   ├── CommunitiesList
        │   │   ├── CommunityFeed
        │   │   └── CreateCommunityPost
        │   └── Profile → ProfileNavigator (Stack)
        │       ├── ProfileMain
        │       ├── EditProfile
        │       ├── EditPhotos
        │       ├── Interests
        │       └── Languages
        │
        ├── Globe (pantalla directa)
        ├── Groups → GroupsNavigator (Stack)
        │   ├── GroupsList
        │   ├── GroupChat
        │   ├── CreateGroup
        │   └── GroupSettings
        ├── Notifications (pantalla directa)
        ├── Finance → FinanceNavigator (Stack)
        │   ├── FinanceHome
        │   ├── AddTransaction
        │   ├── TransactionHistory
        │   └── GrantsOverview
        ├── Marketplace → MarketplaceNavigator (Stack)
        │   ├── MarketplaceHome
        │   ├── CreateListing
        │   └── MyListings
        ├── Ticketing → TicketingNavigator (Stack)
        │   ├── TicketingHome
        │   └── MyTickets
        ├── Wellbeing → WellbeingNavigator (Stack)
        │   ├── WellbeingHome
        │   ├── SOSScreen
        │   └── EmergencyContacts
        ├── Exchange → ExchangeNavigator (Stack)
        │   ├── ExchangeHome
        │   ├── FindPartner
        │   ├── ExchangeRequests
        │   └── ExchangeSessionDetail
        ├── Gamification → GamificationNavigator (Stack)
        │   ├── GamificationHome
        │   ├── Achievements
        │   └── Leaderboard
        ├── Challenges → ChallengesNavigator (Stack)
        │   ├── ChallengesList
        │   └── ChallengeDetail
        ├── Housing → HousingNavigator (Stack)
        │   ├── HousingList
        │   └── HousingDetail
        ├── CityGuide → CityGuideNavigator (Stack)
        │   ├── CityGuideList
        │   └── PlaceDetail
        ├── AiAssistant → AiAssistantNavigator (Stack)
        │   └── AiChat
        ├── Settings → SettingsNavigator (Stack)
        │   ├── SettingsMain
        │   ├── PrivacySettings
        │   ├── NotificationSettings
        │   ├── BlockedUsers
        │   └── DeleteAccount
        └── About (pantalla directa)
```

**Tab Bar (barra inferior):**
- 5 tabs: **Inicio** (compass), **Eventos** (calendar), **Chat** (chatbubbles), **Social** (people), **Perfil** (person).
- Estilo: fondo oscuro translúcido (`rgba(4,6,26,0.85)`), punto dorado activo, feedback háptico.

**Drawer (menú lateral):**
- Se abre deslizando desde el borde izquierdo o tocando el icono de menú.
- 3 secciones: **Principal** (Inicio, Globo, Grupos, Notificaciones), **Herramientas** (Finanzas, Marketplace, Tickets, Bienestar, Intercambio, Logros, Retos, Alojamiento, Guía Ciudad, Asistente IA), **Configuración** (Ajustes, Acerca de).
- Header con avatar e iniciales del usuario, email.
- Botón de cerrar sesión con estilo rojo glass.

### 5.4. Estado Global (Zustand)

EraMix gestiona el estado con **13 stores Zustand**:

| Store | Responsabilidad |
|---|---|
| `useAuthStore` | Autenticación: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `login()`, `logout()`, `register()`, `refreshToken()`. Persiste tokens en SecureStore. |
| `useProfileStore` | Datos de perfil: `profile`, `photos`, `updateProfile()`, `addPhoto()`, `deletePhoto()`. |
| `useChatStore` | Chat: `conversations`, `messages`, `sendMessage()`, `loadConversations()`, `markAsRead()`. |
| `useDiscoverStore` | Discover: `users`, `currentIndex`, `sendFriendRequest()`, `loadUsers()`. |
| `useEventsStore` | Eventos: `events`, `createEvent()`, `joinEvent()`, `leaveEvent()`. |
| `useCommunitiesStore` | Comunidades: `communities`, `posts`, `joinCommunity()`, `createPost()`, `toggleLike()`. |
| `useGroupsStore` | Grupos: `groups`, `messages`, `createGroup()`, `addMembers()`. |
| `useFinanceStore` | Finanzas: `transactions`, `summary`, `grants`, `createTransaction()`. |
| `useNotificationsStore` | Notificaciones: `notifications`, `unreadCount`, `markAsRead()`, `markAllAsRead()`. |
| `useGlobeStore` | Globo 3D: `countryStats`, `loadStats()`. |
| `useLocationStore` | Ubicación: `latitude`, `longitude`, `city`, `updateLocation()`. |
| `useAppStore` | Estado general: `isOnline`, `isLoading`, `theme`. |

### 5.5. Capa API (Axios + React Query)

**Configuración del cliente Axios** (`api/client.ts`):
- `baseURL`: `http://192.168.0.214:8080/api/v1`
- Interceptor de request: añade `Authorization: Bearer <token>`.
- Interceptor de response: si recibe 401, intenta refresh token automáticamente.

**Servicios API** (25 archivos en `api/`):

| Archivo | Endpoints que consume |
|---|---|
| `authService.ts` | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` |
| `profileService.ts` | `/users/me`, `/users/{id}`, `/users/me/photo`, `/users/me/photos`, `/users/me/location` |
| `chat.ts` | `/conversations`, `/conversations/{id}/messages` |
| `communities.ts` | `/communities`, `/communities/{id}/posts`, `/communities/{id}/join` |
| `events.ts` | `/events`, `/events/upcoming`, `/events/{id}/join` |
| `groups.ts` | `/groups`, `/groups/{id}/messages` |
| `financeService.ts` | `/finance/transactions`, `/finance/summary`, `/finance/grants` |
| `marketplaceService.ts` | `/marketplace/listings`, `/marketplace/escrow` |
| `ticketingService.ts` | `/tickets/listings`, `/tickets/purchase`, `/tickets/my-tickets` |
| `wellbeingService.ts` | `/wellbeing/checkin`, `/wellbeing/sos`, `/wellbeing/emergency-contacts` |
| `exchange.ts` | `/exchange/partners`, `/exchange/requests`, `/exchange/sessions` |
| `gamification.ts` | `/gamification/progress`, `/gamification/achievements`, `/gamification/leaderboard` |
| `challenges.ts` | `/challenges`, `/challenges/{id}/submissions` |
| `housing.ts` | `/housing` |
| `cityGuide.ts` | `/city-guide/places`, `/city-guide/places/{id}/reviews` |
| `globe.ts` | `/globe/stats` |
| `aiAssistant.ts` | `/ai/conversations`, `/ai/chat` |
| `agentService.ts` | `/agent/chat` |
| `notifications.ts` | `/notifications`, `/notifications/unread-count` |
| `search.ts` | `/search`, `/search/nearby` |
| `ocrService.ts` | `/ocr/scan`, `/ocr/scans` |
| `privacyService.ts` | `/privacy/consents`, `/privacy/data-export` |
| `stories.ts` | `/stories`, `/stories/feed` |
| `discoverService.ts` | `/search/nearby`, `/friends/requests` |
| `client.ts` | Configuración base de Axios |

### 5.6. Hooks Personalizados

| Hook | Descripción |
|---|---|
| `useWebSocket` | Conexión STOMP WebSocket con reconexión automática. Gestiona suscripciones a `/user/{userId}/queue/messages`. |
| `useDebouncedSearch` | Búsqueda con debounce (retrasa la petición hasta que el usuario deja de escribir). |
| `useInfiniteScroll` | Scroll infinito con paginación automática. |
| `useRefreshControl` | Pull-to-refresh con estados de carga. |
| `useKeyboardAware` | Ajuste automático del layout cuando aparece el teclado. |
| `useDebounce` | Hook genérico de debounce para cualquier valor. |
| `useNetworkStatus` | Detecta si el dispositivo tiene conexión a internet. |

### 5.7. Tipos TypeScript

EraMix tiene **24+ archivos de tipos** que cubren todo el dominio:

| Archivo | Tipos definidos |
|---|---|
| `auth.ts` | `LoginRequest`, `RegisterRequest`, `AuthResponse`, `AuthStackParamList` |
| `user.ts` | `User`, `UserProfile`, `UserPhoto`, `UserLanguage`, `UserUpdateRequest` |
| `chat.ts` | `Conversation`, `Message`, `SendMessageRequest`, `ChatStackParamList` |
| `communities.ts` | `Community`, `CommunityPost`, `CommunityComment`, `CommunitiesStackParamList` |
| `events.ts` | `Event`, `EventParticipant`, `EventsStackParamList` |
| `groups.ts` | `Group`, `GroupMessage`, `GroupMember`, `GroupsStackParamList` |
| `finance.ts` | `Transaction`, `FinancialSummary`, `Grant`, `FinanceStackParamList` |
| `marketplace.ts` | `Listing`, `EscrowTransaction`, `MarketplaceStackParamList` |
| `ticketing.ts` | `TicketListing`, `Ticket`, `TicketingStackParamList` |
| `wellbeing.ts` | `WellbeingCheckin`, `EmergencyContact`, `WellbeingStackParamList` |
| `exchange.ts` | `ExchangePartner`, `ExchangeRequest`, `ExchangeSession`, `ExchangeStackParamList` |
| `gamification.ts` | `UserProgress`, `Achievement`, `LeaderboardEntry`, `GamificationStackParamList` |
| `challenges.ts` | `Challenge`, `Submission`, `ChallengesStackParamList` |
| `housing.ts` | `HousingPost`, `HousingStackParamList` |
| `cityGuide.ts` | `Place`, `PlaceReview`, `CityGuideStackParamList` |
| `globe.ts` | `CountryStats` |
| `notifications.ts` | `Notification` |
| `discover.ts` | `DiscoverUser`, `DiscoverStackParamList` |
| `aiAssistant.ts` | `AiConversation`, `AiMessage`, `AiAssistantStackParamList` |
| `stories.ts` | `Story`, `StoryView` |
| `ocr.ts` | `OcrScan`, `ExtractedEntity` |
| `privacy.ts` | `ConsentStatus`, `ConsentUpdate` |
| `index.ts` | `RootStackParamList`, `MainTabParamList`, `DrawerParamList` |

---

## 6. Pantallas — Documentación Exhaustiva

### 6.1. Módulo de Autenticación

#### SplashScreen
- **Ruta de navegación:** `Auth > Splash`
- **Descripción:** Pantalla de carga inicial que muestra el logo de EraMix con animación de aparición. Verifica si existe un token almacenado en SecureStore y redirige automáticamente.
- **Comportamiento:** Si hay token válido → navega a `Main`. Si no → navega a `Onboarding` (primera vez) o `Login` (ya visto).

#### OnboardingScreen
- **Ruta de navegación:** `Auth > Onboarding`
- **Descripción:** Carrusel de bienvenida con 3-4 slides que presentan las funcionalidades principales de EraMix.
- **Botones:** "Siguiente" (avanza slide), "Empezar" (último slide, va a `Register`), "Ya tengo cuenta" (va a `Login`).

#### LoginScreen
- **Ruta de navegación:** `Auth > Login`
- **Descripción:** Formulario de inicio de sesión.
- **Campos:** Email (GlassInput, validación de formato), Contraseña (GlassInput, toggle de visibilidad con ojo).
- **Botones:** "Iniciar sesión" (GlassButton primary), "¿Olvidaste tu contraseña?" (navega a ForgotPassword), "Crear cuenta" (navega a Register).
- **API:** `POST /api/v1/auth/login`
- **Feedback:** Toast de error en credenciales incorrectas, spinner de carga.

#### RegisterScreen
- **Ruta de navegación:** `Auth > Register`
- **Descripción:** Formulario de registro multi-campo.
- **Campos:** Nombre, Apellido, Email, Contraseña, Confirmar contraseña.
- **Validaciones:** Email válido, contraseña mínima 8 caracteres con mayúscula/minúscula/número/especial, passwords coincidentes.
- **Botones:** "Crear cuenta" (GlassButton primary), "Ya tengo cuenta" (navega a Login).
- **API:** `POST /api/v1/auth/register`

#### ForgotPasswordScreen
- **Ruta de navegación:** `Auth > ForgotPassword`
- **Descripción:** Formulario para solicitar reset de contraseña.
- **Campos:** Email.
- **Botones:** "Enviar enlace" (GlassButton primary), "Volver" (navega atrás).
- **API:** `POST /api/v1/auth/forgot-password`
- **Comportamiento (dev):** Muestra directamente el token de reset en la respuesta.

#### ResetPasswordScreen
- **Ruta de navegación:** `Auth > ResetPassword`
- **Descripción:** Formulario para establecer nueva contraseña.
- **Campos:** Token de reset, Nueva contraseña, Confirmar contraseña.
- **Botones:** "Cambiar contraseña" (GlassButton primary).
- **API:** `POST /api/v1/auth/reset-password`

---

### 6.2. Módulo Discover (Inicio)

#### DiscoverScreen (Pantalla principal)
- **Ruta de navegación:** `HomeTabs > Discover > DiscoverMain`
- **Descripción:** Feed principal estilo Tinder con tarjetas de usuarios (swipe). Muestra estudiantes Erasmus cercanos o de la misma ciudad.
- **Componentes principales:**
  - **Header** con botón de menú (drawer), título "Descubrir", icono de solicitudes de amistad.
  - **UserCard** — Tarjeta grande con foto del usuario, nombre, edad, universidad, ciudad de destino, badges de idiomas, intereses como chips.
  - **Botones de acción:** Rechazar (X rojo), Aceptar/Solicitud de amistad (corazón/check gold).
- **Funcionalidad swipe:** Deslizar derecha = enviar solicitud, izquierda = pasar.
- **API:** `GET /api/v1/search/nearby`, `POST /api/v1/friends/requests`

#### UserDetailScreen
- **Ruta de navegación:** `Discover > UserDetail`
- **Descripción:** Perfil detallado de un usuario al tocar su tarjeta.
- **Contenido:** Foto grande, nombre completo, edad, bio, universidad de origen, universidad de destino, ciudad, país, idiomas con niveles, intereses, fotos adicionales.
- **Botones:** "Enviar solicitud" (si no son amigos), "Enviar mensaje" (si son amigos), "Bloquear".

#### NearbyMapScreen
- **Ruta de navegación:** `Discover > NearbyMap`
- **Descripción:** Mapa interactivo con marcadores de usuarios cercanos.
- **Componentes:** React Native Maps con marcadores personalizados, radio de búsqueda configurable.
- **API:** `GET /api/v1/search/nearby`

#### FriendRequestsScreen
- **Ruta de navegación:** `Discover > FriendRequests`
- **Descripción:** Lista de solicitudes de amistad recibidas y enviadas.
- **Tabs:** "Recibidas" / "Enviadas".
- **Cada solicitud muestra:** Avatar, nombre, universidad, botones "Aceptar" / "Rechazar".
- **API:** `GET /api/v1/friends/requests/received`, `PUT /api/v1/friends/requests/{id}`

---

### 6.3. Módulo de Eventos

#### EventsScreen (Lista de eventos)
- **Ruta de navegación:** `HomeTabs > Events > EventsList`
- **Descripción:** Lista de eventos próximos con filtro por categorías.
- **Componentes:**
  - **Header** con título "Eventos" y botón "+" para crear.
  - **Chips de categoría** horizontales: Todos, Fiesta, Cultural, Deportivo, Académico, etc.
  - **Lista de tarjetas** (GlassCard) con: título, fecha, ubicación, número de participantes, imagen.
  - **FAB** (Floating Action Button) para crear evento.
- **API:** `GET /api/v1/events/upcoming?category=...`

#### EventDetailScreen
- **Ruta de navegación:** `Events > EventDetail`
- **Descripción:** Detalle completo de un evento.
- **Contenido:** Imagen de portada, título, descripción, fecha/hora, ubicación con mapa, organizador (avatar + nombre), lista de participantes (avatares), categoría.
- **Botones:** "Unirme" / "Salir" (toggle), "Estoy interesado", "Compartir".
- **API:** `GET /api/v1/events/{id}`, `POST /api/v1/events/{id}/join`, `DELETE /api/v1/events/{id}/leave`

#### CreateEventScreen (Modal)
- **Ruta de navegación:** `Events > CreateEvent`
- **Descripción:** Formulario modal para crear un nuevo evento.
- **Campos:** Título, Descripción, Categoría (selector), Ubicación, Fecha inicio (DateTimePicker), Fecha fin, Máximo participantes, Toggle público/privado, Imagen.
- **Botones:** "Crear evento" (GlassButton primary), "Cancelar".
- **API:** `POST /api/v1/events`

---

### 6.4. Módulo de Chat y Mensajería

#### ConversationsScreen (Lista de chats)
- **Ruta de navegación:** `HomeTabs > Chat > ConversationsList`
- **Descripción:** Lista de todas las conversaciones activas ordenadas por último mensaje.
- **Cada conversación muestra:** Avatar del otro usuario, nombre, último mensaje (preview), timestamp, badge de mensajes no leídos.
- **Funcionalidad:** Pull-to-refresh, actualización en tiempo real vía WebSocket.
- **API:** `GET /api/v1/conversations`

#### ChatScreen (Chat 1:1)
- **Ruta de navegación:** `Chat > ChatRoom`
- **Descripción:** Pantalla de chat individual en tiempo real.
- **Componentes:**
  - **Header** con avatar y nombre del usuario, indicador de "escribiendo...".
  - **Lista de mensajes** con burbujas (izquierda = recibido, derecha = enviado), timestamps.
  - **Input de mensaje** con campo de texto y botón de enviar (icono de flecha gold).
  - **Indicador de escritura** ("Escribiendo..." con animación de puntos).
- **Funcionalidad:** Envío en tiempo real vía WebSocket STOMP, scroll automático al nuevo mensaje, paginación por cursor al hacer scroll hacia arriba.
- **WebSocket:** Envía a `/app/chat.sendMessage`, escucha en `/user/{userId}/queue/messages`.
- **API REST:** `GET /api/v1/conversations/{id}/messages`, `PUT /api/v1/conversations/{id}/read`.

---

### 6.5. Módulo de Comunidades

#### CommunitiesScreen (Lista)
- **Ruta de navegación:** `HomeTabs > Communities > CommunitiesList`
- **Descripción:** Exploración de comunidades temáticas.
- **Secciones:**
  - **Mis comunidades** — Comunidades a las que pertenezco.
  - **Sugeridas** — Comunidades recomendadas según intereses.
  - **Todas** — Búsqueda con filtro por categoría.
- **Categorías:** Cultural, Académico, Deportes, Viajes, Música, Gaming, Cocina, etc.
- **Cada comunidad muestra:** Avatar, nombre, categoría, número de miembros, botón "Unirse".
- **API:** `GET /api/v1/communities`, `GET /api/v1/communities/my`, `GET /api/v1/communities/suggested`

#### CommunityFeedScreen (Feed)
- **Ruta de navegación:** `Communities > CommunityFeed`
- **Descripción:** Feed de posts de una comunidad.
- **Componentes:**
  - **Header** con nombre de la comunidad, miembros, botón "Salir".
  - **FAB** para crear nuevo post.
  - **Posts** con: autor (avatar + nombre), contenido, imagen opcional, likes (corazón toggle), comentarios, timestamp.
- **API:** `GET /api/v1/communities/{id}/posts`, `POST /api/v1/communities/{id}/posts/{postId}/like`

#### CreateCommunityPostScreen
- **Ruta de navegación:** `Communities > CreateCommunityPost`
- **Descripción:** Formulario para crear un post en una comunidad.
- **Campos:** Contenido (texto libre), Imagen opcional.
- **Botones:** "Publicar" (GlassButton primary).
- **API:** `POST /api/v1/communities/{id}/posts`

---

### 6.6. Módulo de Perfil

#### ProfileScreen (Mi perfil)
- **Ruta de navegación:** `HomeTabs > Profile > ProfileMain`
- **Descripción:** Vista del perfil del usuario autenticado.
- **Contenido:**
  - Foto de perfil grande (circular), nombre completo, bio.
  - **Universidad de origen** y **universidad de destino**.
  - **Ciudad de destino** y **país**.
  - **Fechas de movilidad** (inicio — fin).
  - **Idiomas** con niveles (BASIC/INTERMEDIATE/ADVANCED/NATIVE).
  - **Intereses** como chips.
  - **Galería de fotos** adicionales.
- **Botones:** "Editar perfil", "Editar fotos", "Intereses", "Idiomas".
- **API:** `GET /api/v1/users/me`

#### EditProfileScreen
- **Ruta de navegación:** `Profile > EditProfile`
- **Descripción:** Formulario de edición del perfil.
- **Campos editables:** Nombre, Apellido, Bio, Fecha de nacimiento (DatePicker), Universidad de origen (búsqueda), Universidad de destino (búsqueda), Ciudad de destino, País, Fecha inicio/fin de movilidad.
- **Botones:** "Guardar cambios" (GlassButton primary).
- **API:** `PUT /api/v1/users/me`

#### EditPhotosScreen
- **Ruta de navegación:** `Profile > EditPhotos`
- **Descripción:** Grid de 6 slots para gestión de fotos del perfil.
- **Componentes:**
  - Grid 2x3 con slots numerados.
  - **Slot con foto:** Muestra la imagen con botón "X" para eliminar. El slot 1 tiene badge "Principal".
  - **Slot vacío:** Borde punteado con icono "+". Al tocar, abre el image picker.
  - **Indicador de subida** (spinner sobre la foto mientras se sube).
- **API:** `POST /api/v1/users/me/photos`, `DELETE /api/v1/users/me/photos/{id}`, `GET /api/v1/users/me/photos`

#### InterestsScreen
- **Ruta de navegación:** `Profile > Interests`
- **Descripción:** Selección de intereses del catálogo.
- **Componentes:** Grid de chips seleccionables. Los activos se muestran con fondo gold. Cada chip tiene icono + label.
- **Botones:** "Guardar" (fijo en footer con padding para tab bar).
- **API:** `GET /api/v1/catalog/interests`, `PUT /api/v1/users/me`

#### LanguagesScreen
- **Ruta de navegación:** `Profile > Languages`
- **Descripción:** Gestión de idiomas y niveles de competencia.
- **Componentes:**
  - Lista de idiomas seleccionados con selector de nivel (BASIC, INTERMEDIATE, ADVANCED, NATIVE).
  - Selector de idiomas del catálogo.
  - Botón "Añadir idioma".
- **Botones:** "Guardar" (fijo en footer con spacer para tab bar).
- **API:** `GET /api/v1/catalog/languages`, `PUT /api/v1/users/me`

---

### 6.7. Módulo de Grupos

#### GroupsListScreen
- **Ruta de navegación:** `Drawer > Groups > GroupsList`
- **Descripción:** Lista de mis grupos de chat.
- **Cada grupo muestra:** Avatar/icono, nombre, último mensaje, miembros count, badge de no leídos.
- **FAB** para crear grupo.
- **API:** `GET /api/v1/groups/my`

#### GroupChatScreen
- **Ruta de navegación:** `Groups > GroupChat`
- **Descripción:** Chat de grupo en tiempo real (igual que ChatScreen pero con múltiples participantes).
- **Diferencias con DM:** Los mensajes muestran el nombre del remitente, icono del grupo en el header, indicador de escritura con nombre del usuario.
- **WebSocket:** Envía a `/app/group.sendMessage`, escucha en `/topic/group/{groupId}` y `/user/{userId}/queue/group-messages`.

#### CreateGroupScreen
- **Ruta de navegación:** `Groups > CreateGroup`
- **Descripción:** Formulario para crear un grupo nuevo.
- **Campos:** Nombre del grupo, Descripción, Selección de miembros (lista de amigos con checkboxes).
- **API:** `POST /api/v1/groups`

#### GroupSettingsScreen
- **Ruta de navegación:** `Groups > GroupSettings`
- **Descripción:** Configuración del grupo (solo admin).
- **Opciones:** Cambiar nombre, gestionar miembros (añadir/eliminar), abandonar grupo.

---

### 6.8. Módulo del Globo 3D

#### GlobeScreen
- **Ruta de navegación:** `Drawer > Globe`
- **Descripción:** Globo terráqueo 3D interactivo renderizado con Three.js (expo-gl).
- **Funcionalidad:**
  - Rotación con gestos (arrastrar para girar).
  - Marcadores por país mostrando cantidad de estudiantes Erasmus.
  - Al tocar un país: popup con estadísticas (número de estudiantes, universidades principales).
- **Componentes:** `Globe3D` / `InteractiveGlobe` — Componentes Three.js con textura de la Tierra.
- **API:** `GET /api/v1/globe/stats`

---

### 6.9. Módulo de Notificaciones

#### NotificationsScreen
- **Ruta de navegación:** `Drawer > Notifications`
- **Descripción:** Lista de todas las notificaciones del usuario.
- **Tipos de notificación:** Solicitud de amistad, amistad aceptada, nuevo mensaje, invitación a evento, like en post, comentario, logro desbloqueado, etc.
- **Cada notificación muestra:** Icono del tipo, título, mensaje, timestamp, indicador de leída/no leída.
- **Acciones:** Tocar para navegar al recurso, deslizar para eliminar, botón "Marcar todo como leído".
- **API:** `GET /api/v1/notifications`, `PUT /api/v1/notifications/read-all`

---

### 6.10. Módulo de Finanzas

#### FinanceHomeScreen
- **Ruta de navegación:** `Drawer > Finance > FinanceHome`
- **Descripción:** Dashboard financiero del estudiante.
- **Componentes:**
  - **Balance general** — Tarjeta grande con ingreso total, gasto total, balance neto. Iconos gold.
  - **Toggle** Ingresos/Gastos (switch con estilo gold activo).
  - **Gráfico/resumen** de gastos por categoría.
  - **Últimas transacciones** — Lista resumida.
  - **Becas/Grants** — Sección con becas activas y montos.
  - **Alertas de presupuesto** — Banner si hay alertas sin reconocer.
- **Botones:** "Añadir transacción" (navega a AddTransaction), "Ver historial" (navega a TransactionHistory), "Ver becas" (navega a GrantsOverview).
- **API:** `GET /api/v1/finance/summary`, `GET /api/v1/finance/transactions`, `GET /api/v1/finance/grants`

#### AddTransactionScreen
- **Ruta de navegación:** `Finance > AddTransaction`
- **Descripción:** Formulario para registrar un gasto o ingreso.
- **Campos:** Monto (numérico), Descripción, Categoría (selector con iconos), Tipo (INCOME/EXPENSE), Fecha.
- **API:** `POST /api/v1/finance/transactions`

#### TransactionHistoryScreen
- **Ruta de navegación:** `Finance > TransactionHistory`
- **Descripción:** Historial completo de transacciones con filtros de fecha.
- **Filtros:** Rango de fechas (DatePicker), tipo (ingresos/gastos).
- **API:** `GET /api/v1/finance/transactions?startDate=...&endDate=...`

#### GrantsOverviewScreen
- **Ruta de navegación:** `Finance > GrantsOverview`
- **Descripción:** Detalle de becas y subvenciones.
- **Cada beca muestra:** Nombre, monto total, monto desembolsado, monto restante, barra de progreso.
- **API:** `GET /api/v1/finance/grants`

---

### 6.11. Módulo de Marketplace

#### MarketplaceHomeScreen
- **Ruta de navegación:** `Drawer > Marketplace > MarketplaceHome`
- **Descripción:** Feed de productos a la venta entre estudiantes.
- **Componentes:**
  - **Barra de búsqueda** con icono.
  - **Botones de acción** en header: "Vender" (icono gold con fondo gold), "Mis anuncios".
  - **Grid/Lista de productos** con: foto, título, precio, condición, ciudad.
- **API:** `GET /api/v1/marketplace/listings`

#### CreateListingScreen
- **Ruta de navegación:** `Marketplace > CreateListing`
- **Descripción:** Formulario para publicar un artículo en venta.
- **Campos:** Título, Descripción, Precio, Moneda, Condición (NEW/LIKE_NEW/GOOD/FAIR), Categoría, Ciudad, Fotos (multi-selección).
- **API:** `POST /api/v1/marketplace/listings`

#### MyListingsScreen
- **Ruta de navegación:** `Marketplace > MyListings`
- **Descripción:** Lista de mis anuncios activos con opción de eliminar.
- **API:** `GET /api/v1/marketplace/my-listings`, `DELETE /api/v1/marketplace/listings/{id}`

---

### 6.12. Módulo de Ticketing

#### TicketingHomeScreen
- **Ruta de navegación:** `Drawer > Ticketing > TicketingHome`
- **Descripción:** Entradas disponibles para eventos y actividades.
- **Cada entrada muestra:** Nombre del evento, venue, fecha, precio, entradas restantes.
- **Botones:** "Comprar" (por cada ticket), "Mis entradas" (navega a MyTickets).
- **API:** `GET /api/v1/tickets/listings`, `POST /api/v1/tickets/purchase/{id}`

#### MyTicketsScreen
- **Ruta de navegación:** `Ticketing > MyTickets`
- **Descripción:** Mis entradas compradas con QR para validación.
- **Cada ticket muestra:** Nombre del evento, fecha, venue, código QR generado dinámicamente.
- **QR:** Contiene un payload firmado criptográficamente (HMAC) con UUID del ticket.
- **API:** `GET /api/v1/tickets/my-tickets`, `GET /api/v1/tickets/qr/{uuid}`

---

### 6.13. Módulo de Bienestar y SOS

#### WellbeingHomeScreen
- **Ruta de navegación:** `Drawer > Wellbeing > WellbeingHome`
- **Descripción:** Centro de bienestar del estudiante.
- **Componentes:**
  - **Mood tracker** — Registro de estado de ánimo (emojis 1-5: 😢😕😐🙂😊).
  - **Historial de check-ins** — Lista con mood, fecha, notas.
  - **Resumen** — Promedio de bienestar, tendencia.
  - **Botón SOS** — Botón rojo grande de emergencia.
  - **Contactos de emergencia** — Acceso rápido.
  - **Recursos locales** — Hospitales, policía, líneas de ayuda.
- **API:** `GET /api/v1/wellbeing/summary`, `GET /api/v1/wellbeing/checkins`

#### SOSScreen
- **Ruta de navegación:** `Wellbeing > SOSScreen`
- **Descripción:** Pantalla de emergencia con activación rápida.
- **Funcionalidad:**
  - **Botón SOS grande** — Al presionar largo, envía alerta con geolocalización.
  - **Contactos de emergencia** — Llamada directa.
  - **Números locales** — 112 (Europa), policía, ambulancia.
  - **Compartir ubicación** — Envía coordenadas GPS a contactos de emergencia.
- **API:** `POST /api/v1/wellbeing/sos`

#### EmergencyContactsScreen
- **Ruta de navegación:** `Wellbeing > EmergencyContacts`
- **Descripción:** Gestión de contactos de emergencia.
- **Campos por contacto:** Nombre, Teléfono, Relación (selector chip: Padre, Madre, Hermano/a, Pareja, Amigo/a, Otro).
- **Botones:** "Añadir contacto" (abre formulario), "Eliminar" (por contacto).
- **API:** `GET /api/v1/wellbeing/emergency-contacts`, `POST /api/v1/wellbeing/emergency-contacts`, `DELETE /api/v1/wellbeing/emergency-contacts/{id}`

---

### 6.14. Módulo de Intercambio de Idiomas

#### ExchangeHomeScreen
- **Ruta de navegación:** `Drawer > Exchange > ExchangeHome`
- **Descripción:** Hub de intercambio lingüístico.
- **Secciones:**
  - **Mis sesiones** — Próximas sesiones agendadas.
  - **Solicitudes pendientes** — Recibidas y enviadas.
  - **Acciones rápidas** — "Buscar partner", "Mis solicitudes".
- **API:** `GET /api/v1/exchange/sessions`, `GET /api/v1/exchange/requests/received`

#### FindPartnerScreen
- **Ruta de navegación:** `Exchange > FindPartner`
- **Descripción:** Lista de usuarios compatibles para intercambio.
- **Cada partner muestra:** Avatar, nombre, idiomas que ofrece/busca, rating.
- **Botón:** "Enviar solicitud" → formulario con selección de idioma ofrecido y buscado, mensaje.
- **API:** `GET /api/v1/exchange/partners`, `POST /api/v1/exchange/requests`

#### ExchangeRequestsScreen
- **Ruta de navegación:** `Exchange > ExchangeRequests`
- **Descripción:** Lista de solicitudes de intercambio.
- **Tabs:** "Recibidas" / "Enviadas".
- **Acciones:** "Aceptar" / "Rechazar" para solicitudes recibidas.
- **API:** `GET /api/v1/exchange/requests/received`, `GET /api/v1/exchange/requests/sent`, `PUT /api/v1/exchange/requests/{id}/accept`

#### ExchangeSessionDetailScreen
- **Ruta de navegación:** `Exchange > ExchangeSessionDetail`
- **Descripción:** Detalle de una sesión programada.
- **Contenido:** Partner, idiomas, fecha/hora, duración, estado.
- **Botones:** "Completar sesión", "Cancelar", "Dejar valoración".
- **API:** `PUT /api/v1/exchange/sessions/{id}/complete`, `POST /api/v1/exchange/reviews`

---

### 6.15. Módulo de Gamificación

#### GamificationHomeScreen
- **Ruta de navegación:** `Drawer > Gamification > GamificationHome`
- **Descripción:** Dashboard de progresión del usuario.
- **Componentes:**
  - **Nivel actual** — Círculo con icono de nivel, número prominente.
  - **Barra de XP** — LinearGradient gold mostrando progreso hasta el siguiente nivel.
  - **XP actual / XP necesario** — Texto numérico.
  - **Acciones rápidas** — "Ver logros", "Clasificación".
- **API:** `GET /api/v1/gamification/progress`

#### AchievementsScreen
- **Ruta de navegación:** `Gamification > Achievements`
- **Descripción:** Lista de todos los logros disponibles.
- **Cada logro muestra:** Icono, nombre, descripción, XP de recompensa, estado (desbloqueado con fecha / bloqueado con progreso).
- **Categorías:** Social, Explorer, Academic, Language, etc.
- **API:** `GET /api/v1/gamification/achievements`

#### LeaderboardScreen
- **Ruta de navegación:** `Gamification > Leaderboard`
- **Descripción:** Clasificación global de usuarios por XP.
- **Componentes:**
  - **Top 3** — Podio especial con avatares grandes y colores (oro, plata, bronce).
  - **Lista completa** — Posición, avatar, nombre, nivel, XP total.
  - **Mi posición** — Destacada en la lista.
- **API:** `GET /api/v1/gamification/leaderboard`

---

### 6.16. Módulo de Retos Fotográficos

#### ChallengesListScreen
- **Ruta de navegación:** `Drawer > Challenges > ChallengesList`
- **Descripción:** Lista de retos fotográficos activos.
- **Cada reto muestra:** Título, tema, fecha límite, XP de recompensa, número de participantes.
- **Estado vacío:** Icono gold de cámara con mensaje "No hay retos activos".
- **API:** `GET /api/v1/challenges`

#### ChallengeDetailScreen
- **Ruta de navegación:** `Challenges > ChallengeDetail`
- **Descripción:** Detalle de un reto con galería de envíos.
- **Componentes:**
  - Info del reto: título, descripción, tema, fechas, XP.
  - Galería de submissions: fotos subidas por usuarios con votos.
  - Botón "Participar" → Formulario para subir foto con caption.
  - Botones de voto (corazón) por cada foto.
- **API:** `GET /api/v1/challenges/{id}/submissions`, `POST /api/v1/challenges/{id}/submissions`, `POST /api/v1/challenges/submissions/{id}/vote`

---

### 6.17. Módulo de Alojamiento

#### HousingListScreen
- **Ruta de navegación:** `Drawer > Housing > HousingList`
- **Descripción:** Lista de ofertas de alojamiento entre estudiantes.
- **Filtros:** Ciudad (barra de búsqueda).
- **Cada publicación muestra:** Tipo (Room/Apartment/Studio), título, precio, ciudad, descripción truncada.
- **FAB** para crear nueva publicación.
- **API:** `GET /api/v1/housing?city=...`

#### HousingDetailScreen
- **Ruta de navegación:** `Housing > HousingDetail`
- **Descripción:** Detalle completo de una oferta de alojamiento.
- **Contenido:** Título, tipo, precio, dirección, descripción completa, autor (avatar + nombre), botón de contacto.
- **API:** Info ya cargada desde el listado o `GET /api/v1/housing/{id}`.

---

### 6.18. Módulo de Guía de Ciudad

#### CityGuideListScreen
- **Ruta de navegación:** `Drawer > CityGuide > CityGuideList`
- **Descripción:** Exploración de lugares de interés en la ciudad.
- **Componentes:**
  - **Barra de búsqueda** con icono y subtítulo.
  - **Chips de categoría:** Restaurantes, Cafés, Bares, Transporte, Ocio, Bibliotecas, etc.
  - **Lista de lugares** con: nombre, categoría, rating (estrellas), número de reseñas, dirección.
- **Safe area insets** aplicados correctamente.
- **API:** `GET /api/v1/city-guide/places?city=...&category=...`

#### PlaceDetailScreen
- **Ruta de navegación:** `CityGuide > PlaceDetail`
- **Descripción:** Detalle de un lugar con reseñas.
- **Contenido:** Nombre, descripción, categoría, dirección, coordenadas (mapa), rating promedio, lista de reseñas.
- **Botón:** "Añadir reseña" → Formulario con rating (estrellas) y comentario.
- **API:** `GET /api/v1/city-guide/places/{id}`, `GET /api/v1/city-guide/places/{id}/reviews`, `POST /api/v1/city-guide/places/{id}/reviews`

---

### 6.19. Módulo de Asistente IA

#### AiChatScreen
- **Ruta de navegación:** `Drawer > AiAssistant > AiChat`
- **Descripción:** Chat conversacional con asistente IA potenciado por Claude (Anthropic).
- **Componentes:**
  - Lista de mensajes (burbujas USER/ASSISTANT).
  - Input de texto con botón enviar.
  - Indicador de "pensando..." mientras la IA responde.
  - Lista de conversaciones previas (lateral o modal).
- **Capacidades del asistente:**
  - Responder preguntas sobre becas Erasmus.
  - Asesorar sobre trámites, documentación, visados.
  - Dar información sobre la ciudad de destino.
  - Ayudar con el presupuesto y finanzas.
  - Sugerir actividades y eventos.
- **API:** `POST /api/v1/ai/chat`, `GET /api/v1/ai/conversations`

#### Agente Orquestador (vía AiChatScreen)
- **Descripción:** Sistema multi-agente avanzado con LangChain4j que puede ejecutar herramientas.
- **API:** `POST /api/v1/agent/chat`

---

### 6.20. Módulo de Ajustes

#### SettingsScreen (Principal)
- **Ruta de navegación:** `Drawer > Settings > SettingsMain`
- **Descripción:** Pantalla principal de configuración.
- **Opciones (como lista de items):**
  - "Privacidad y datos" → PrivacySettings
  - "Notificaciones" → NotificationSettings
  - "Usuarios bloqueados" → BlockedUsers
  - "Eliminar cuenta" → DeleteAccount
  - "Cerrar sesión" (botón destructivo).
- **Cada item:** Icono Ionicons, label, chevron derecho.

#### PrivacySettingsScreen
- **Ruta de navegación:** `Settings > PrivacySettings`
- **Descripción:** Gestión de consentimientos GDPR.
- **Toggles:** Analytics, Marketing, Third-party data sharing.
- **Acciones:** "Exportar mis datos", "Solicitar eliminación de cuenta".
- **API:** `GET /api/v1/privacy/consents`, `PUT /api/v1/privacy/consents`, `POST /api/v1/privacy/data-export`

#### NotificationSettingsScreen
- **Ruta de navegación:** `Settings > NotificationSettings`
- **Descripción:** Configuración de preferencias de notificaciones.
- **Toggles por tipo:** Mensajes, solicitudes de amistad, eventos, comunidades, marketplace, etc.

#### BlockedUsersScreen
- **Ruta de navegación:** `Settings > BlockedUsers`
- **Descripción:** Lista de usuarios bloqueados con opción de desbloquear.
- **API:** `GET /api/v1/friends/blocked`, `DELETE /api/v1/friends/block/{id}`

#### DeleteAccountScreen
- **Ruta de navegación:** `Settings > DeleteAccount`
- **Descripción:** Confirmación de eliminación de cuenta.
- **Proceso:** Campo de contraseña para confirmar, aviso de 30 días de gracia, botón rojo "Eliminar permanentemente".
- **API:** `DELETE /api/v1/auth/account`

---

### 6.21. Módulo de Stories

- **Backend:** `StoryController` con endpoints para crear, eliminar, ver feed y registrar vistas.
- **Funcionalidad:** Stories efímeras que expiran a las 24h. Subida de foto con caption. Feed de stories de amigos. Registro de visualización.
- **API:** `POST /api/v1/stories` (multipart), `GET /api/v1/stories/feed`, `POST /api/v1/stories/{id}/view`, `DELETE /api/v1/stories/{id}`

---

### 6.22. Módulo de Búsqueda

- **Backend:** `SearchController` con búsqueda combinada, nearby (Haversine), por ciudad y por país.
- **Funcionalidad frontend:** Integrada en DiscoverScreen y accesible desde la API.
- **Algoritmo Haversine:** Calcula distancia en km entre dos coordenadas GPS para encontrar usuarios cercanos en un radio configurable.
- **API:**
  - `POST /api/v1/search` — Búsqueda combinada con filtros (query, interests, languages, city, country).
  - `GET /api/v1/search/nearby?latitude=...&longitude=...&radiusKm=50`
  - `GET /api/v1/search/by-city?city=...`
  - `GET /api/v1/search/by-country?country=...`

---

### 6.23. Módulo OCR — Escáner de Documentos

- **Backend:** `OcrController` + `OcrService` usando **Tesseract** (Tess4j) y **JavaCV**.
- **Funcionalidad:** El usuario sube una imagen de un documento (beca, matrícula, pasaporte) y el sistema extrae texto y entidades relevantes.
- **Tipos de documento:** Becas, learning agreements, facturas, tickets.
- **API:**
  - `POST /api/v1/ocr/scan` — Body: `{imageBase64, documentType}`. Respuesta: texto extraído + entidades.
  - `GET /api/v1/ocr/scans` — Historial de escaneos.

---

### 6.24. Módulo GDPR / Privacidad

- **Backend:** `GdprController` + `GdprService`.
- **Funcionalidad compliant con GDPR europeo:**
  - Gestión de consentimientos (analytics, marketing, third-party).
  - Auditoría de cambios (IP, timestamp, acción).
  - Exportación de datos personales (derecho de portabilidad).
  - Eliminación de cuenta con 30 días de gracia (derecho al olvido).
- **API:**
  - `GET /api/v1/privacy/consents`
  - `PUT /api/v1/privacy/consents`
  - `POST /api/v1/privacy/data-export`
  - `DELETE /api/v1/privacy/account`

---

### 6.25. Pantalla Acerca de

#### AboutScreen
- **Ruta de navegación:** `Drawer > About`
- **Descripción:** Información sobre la aplicación.
- **Contenido:** Logo, nombre, versión, descripción, créditos, enlaces.

---

## 7. Infraestructura y DevOps

### Docker Compose

EraMix utiliza dos archivos Docker Compose:

**`docker-compose.yml`** (producción):
- **db** — MySQL 8 con volumen persistente.
- **redis** — Redis 7 Alpine con volumen persistente.
- **backend** — Imagen construida desde `backend/Dockerfile`.

**`docker-compose.dev.yml`** (desarrollo):
- Configuración adaptada para desarrollo local.

### Kubernetes (k8s/)

Manifiestos completos para despliegue en Kubernetes:

| Archivo | Descripción |
|---|---|
| `namespace.yaml` | Namespace `eramix` |
| `configmap.yaml` | Variables de configuración |
| `secret.yaml` | Secretos (JWT, DB password, etc.) |
| `service-account.yaml` | Service account para el backend |
| `mysql.yaml` | StatefulSet de MySQL con PV |
| `redis.yaml` | Deployment de Redis |
| `backend-deployment.yaml` | Deployment del backend (replicas, probes) |
| `backend-service.yaml` | Service del backend (ClusterIP) |
| `ingress.yaml` | Ingress para exponer al exterior |
| `hpa.yaml` | HorizontalPodAutoscaler (auto-escalado) |
| `pdb.yaml` | PodDisruptionBudget (alta disponibilidad) |

### Script de Inicio (`start.sh`)

Script "Bulletproof Edition" v3.0 que:
1. Verifica que MySQL esté corriendo (systemd).
2. Inicia Redis en Docker si no está activo.
3. Compila el backend con Maven.
4. Inicia el backend Spring Boot.
5. Inicia el frontend Expo con la IP correcta (`EXPO_PUBLIC_API_BASE_URL`).

---

## 8. Enums del Sistema

| Enum | Valores | Uso |
|---|---|---|
| `Role` | `USER`, `ADMIN` | Rol de usuario |
| `ProficiencyLevel` | `BASIC`, `INTERMEDIATE`, `ADVANCED`, `NATIVE` | Nivel de idioma |
| `FriendRequestStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED` | Estado de solicitud de amistad |
| `MessageType` | `TEXT`, `IMAGE`, `AUDIO`, `VIDEO`, `FILE` | Tipo de mensaje |
| `NotificationType` | `FRIEND_REQUEST`, `FRIEND_ACCEPTED`, `MESSAGE`, `EVENT_INVITE`, `COMMUNITY_POST`, `ACHIEVEMENT_UNLOCKED`, etc. | Tipo de notificación |
| `EventParticipantStatus` | `GOING`, `INTERESTED`, `NOT_GOING` | Estado de participación |
| `CommunityCategory` | `CULTURAL`, `ACADEMIC`, `SPORTS`, `TRAVEL`, `MUSIC`, `GAMING`, `COOKING`, etc. | Categoría de comunidad |
| `CommunityRole` | `ADMIN`, `MODERATOR`, `MEMBER` | Rol en comunidad |
| `CommunityMemberStatus` | `ACTIVE`, `BANNED` | Estado de miembro |
| `GroupRole` | `ADMIN`, `MEMBER` | Rol en grupo |
| `HousingPostType` | `ROOM`, `APARTMENT`, `STUDIO` | Tipo de alojamiento |
| `ItemCondition` | `NEW`, `LIKE_NEW`, `GOOD`, `FAIR` | Condición de producto |
| `PlaceCategory` | `RESTAURANT`, `CAFE`, `BAR`, `TRANSPORT`, `ENTERTAINMENT`, `LIBRARY`, etc. | Categoría de lugar |
| `ExchangeRequestStatus` | `PENDING`, `ACCEPTED`, `REJECTED` | Estado de solicitud de intercambio |
| `ExchangeSessionStatus` | `SCHEDULED`, `COMPLETED`, `CANCELLED` | Estado de sesión |
| `EscrowStatus` | `INITIATED`, `BUYER_CONFIRMED`, `SELLER_CONFIRMED`, `COMPLETED`, `CANCELLED` | Estado de escrow |
| `BudgetAlertType` | `OVER_BUDGET`, `HIGH_SPENDING`, `LOW_BALANCE` | Tipo de alerta financiera |
| `AchievementCategory` | `SOCIAL`, `EXPLORER`, `ACADEMIC`, `LANGUAGE`, `COMMUNITY` | Categoría de logro |
| `XpSourceType` | `FRIEND_ADDED`, `EVENT_JOINED`, `POST_CREATED`, `CHALLENGE_COMPLETED`, `SESSION_COMPLETED`, etc. | Fuente de XP |
| `AiRole` | `USER`, `ASSISTANT`, `SYSTEM` | Rol en conversación IA |
| `AgentIntentType` | Tipos de intención del agente orquestador | Intención detectada |
| `AgentResponseType` | Tipos de respuesta del agente | Formato de respuesta |
| `ConsentType` | `ANALYTICS`, `MARKETING`, `THIRD_PARTY` | Tipo de consentimiento GDPR |
| `DocumentType` | `GRANT`, `LEARNING_AGREEMENT`, `INVOICE`, `ID_DOCUMENT` | Tipo de documento OCR |
| `EquivalenceStatus` | `PENDING`, `APPROVED`, `REJECTED` | Estado de equivalencia académica |
| `LearningAgreementState` | `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED` | Estado de Learning Agreement |

---

## 📊 Resumen en Números

| Métrica | Cantidad |
|---|---|
| **Controladores REST** | 27 |
| **Endpoints API** | 120+ |
| **Entidades JPA** | 68 |
| **Servicios de negocio** | 25 |
| **Migraciones Flyway** | 20 |
| **Enums** | 26 |
| **Pantallas móvil** | 55+ |
| **Navegadores** | 20 |
| **Stores Zustand** | 13 |
| **Servicios API (frontend)** | 25 |
| **Tipos TypeScript** | 24+ archivos |
| **Componentes Design System** | 25 |
| **Hooks de animación** | 9 |
| **Hooks personalizados** | 7 |
| **Dependencias backend** | 20+ |
| **Dependencias frontend** | 35+ |

---

> **Nota:** Esta documentación refleja el estado actual de la aplicación a junio de 2025. EraMix es un proyecto en desarrollo activo y nuevas funcionalidades pueden ser añadidas.
