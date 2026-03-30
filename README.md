# EraMix

Aplicación móvil nativa para estudiantes de movilidad internacional (Erasmus+ y programas equivalentes). EraMix resuelve la dificultad de construir redes de amistad genuina en la ciudad de destino, ofreciendo una plataforma digital orientada exclusivamente a la socialización no romántica.

## Arquitectura

```
┌─────────────────┐     REST / WebSocket     ┌──────────────────┐     JDBC     ┌─────────┐
│   Mobile App    │◄────────────────────────►│  Spring Boot API │◄────────────►│  MySQL  │
│  (React Native) │         HTTPS            │    (Java 21)     │              │   8.x   │
└─────────────────┘                          └──────────────────┘              └─────────┘
```

- **Frontend:** React Native con Expo, TypeScript, NativeWind
- **Backend:** Spring Boot 3.x, Java 21, API RESTful + WebSockets (STOMP/SockJS)
- **Base de datos:** MySQL 8.x
- **Infraestructura:** Docker, Docker Compose
- **Despliegue:** Render (contenedores Docker)

## Estructura del Proyecto

```
eramix/
├── mobile/                    # App React Native (Expo)
│   ├── src/
│   │   ├── api/               # Cliente HTTP (Axios)
│   │   ├── components/        # Componentes reutilizables
│   │   ├── constants/         # Tokens del design system
│   │   ├── hooks/             # Custom hooks
│   │   ├── navigation/        # Configuración de navegación
│   │   ├── screens/           # Pantallas de la app
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── types/             # Tipos TypeScript
│   │   └── utils/             # Utilidades
│   ├── assets/                # Imágenes y fuentes
│   ├── App.tsx                # Entry point
│   ├── app.json               # Configuración Expo
│   ├── tailwind.config.js     # NativeWind / Tailwind
│   └── package.json
├── backend/                   # API Spring Boot
│   ├── src/main/java/com/eramix/
│   │   ├── config/            # Configuraciones (CORS, Security, WebSocket)
│   │   ├── controller/        # Controladores REST
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entity/            # Entidades JPA
│   │   ├── exception/         # Manejo global de excepciones
│   │   ├── repository/        # Repositorios Spring Data
│   │   ├── security/          # JWT y autenticación
│   │   ├── service/           # Lógica de negocio
│   │   ├── socket/            # Controladores WebSocket
│   │   └── util/              # Constantes y utilidades
│   ├── Dockerfile
│   └── pom.xml
├── docker-compose.yml         # Producción (backend + MySQL)
├── docker-compose.dev.yml     # Desarrollo (solo MySQL)
├── .env.example               # Variables de entorno
├── DESIGN_SYSTEM.md           # Sistema de diseño European Glass
├── RAsCompletados.md          # Evidencia académica de RAs
└── README.md
```

## Requisitos de Instalación

- **Node.js** LTS (v20+)
- **JDK 21** (OpenJDK o Temurin)
- **Docker** y **Docker Compose**
- **Maven 3.8+** (incluido como wrapper en el proyecto)
- **Expo CLI** (`npm install -g expo-cli`)
- **Git**

## Desarrollo Local (Ubuntu)

### 1. Clonar el repositorio

```bash
git clone https://github.com/SantiCode17/eramix.git
cd eramix
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con valores de desarrollo
```

### 3. Levantar la base de datos

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Arrancar el backend

```bash
cd backend
./mvnw spring-boot:run
```

El backend estará disponible en `http://localhost:8080`. Verificar con:

```bash
curl http://localhost:8080/api/health
```

### 5. Arrancar el frontend

```bash
cd mobile
npm install
npx expo start
```

Escanear el código QR con Expo Go en el dispositivo móvil o pulsar `a` para abrir en emulador Android.

## Despliegue en Producción

### Con Docker Compose

```bash
# Configurar .env con valores de producción
docker compose up -d --build
```

### En Render

1. Conectar el repositorio GitHub
2. Configurar las variables de entorno del `.env.example`
3. El `Dockerfile` del backend se construye automáticamente

## Resultados de Aprendizaje

| # | Módulo | RA | Estado |
|---|--------|----|--------|
| 1 | Introducción a la nube pública | RA 3: Redes virtuales y servicios de cómputo | Pendiente |
| 2 | Sostenibilidad | RA 5: Actividades sostenibles | Pendiente |
| 3 | Entornos de desarrollo | RA 4: Optimización con herramientas del entorno | ✅ Trabajado |
| 4 | Programación de servicios y procesos | RA 3: Comunicación en red con sockets | ✅ Trabajado |
| 5 | Programación multimedia y dispositivos móviles | RA 2: Aplicaciones para dispositivos móviles | ✅ Trabajado |
| 6 | Acceso a datos | RA 2: Gestión de información en BBDD relacionales | ✅ Trabajado |

Detalle completo en [RAsCompletados.md](./RAsCompletados.md).

## Tecnologías

### Frontend
React Native · Expo · TypeScript · NativeWind · React Navigation · Zustand · TanStack Query · Axios

### Backend
Spring Boot 3.x · Java 21 · Spring Security · Spring WebSocket (STOMP/SockJS) · Spring Data JPA · MySQL · JWT (jjwt)

### Infraestructura
Docker · Docker Compose · GitHub · Render

## Licencia

Proyecto académico — Proyecto Intermodular de Fin de Ciclo.
