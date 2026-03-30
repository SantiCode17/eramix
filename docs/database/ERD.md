# EraMix — Diagrama Entidad-Relación

Modelo de datos completo de la plataforma EraMix.

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    UNIVERSITY {
        bigint id PK
        varchar name
        varchar city
        varchar country
        decimal latitude
        decimal longitude
        timestamp created_at
        timestamp updated_at
    }

    USER {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar role
        varchar first_name
        varchar last_name
        varchar profile_photo_url
        date date_of_birth
        text bio
        bigint home_university_id FK
        bigint host_university_id FK
        varchar destination_city
        varchar destination_country
        date mobility_start
        date mobility_end
        decimal latitude
        decimal longitude
        timestamp location_updated_at
        boolean is_active
        boolean is_verified
        timestamp last_seen
        timestamp created_at
        timestamp updated_at
    }

    INTEREST {
        bigint id PK
        varchar name UK
        varchar category
        varchar emoji
        timestamp created_at
        timestamp updated_at
    }

    USER_INTEREST {
        bigint user_id FK
        bigint interest_id FK
    }

    LANGUAGE {
        bigint id PK
        varchar code UK
        varchar name
        timestamp created_at
        timestamp updated_at
    }

    USER_LANGUAGE {
        bigint user_id FK
        bigint language_id FK
        varchar proficiency_level
    }

    USER_PHOTO {
        bigint id PK
        bigint user_id FK
        varchar photo_url
        int display_order
        timestamp created_at
        timestamp updated_at
    }

    FRIEND_REQUEST {
        bigint id PK
        bigint sender_id FK
        bigint receiver_id FK
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    FRIENDSHIP {
        bigint id PK
        bigint user_id_1 FK
        bigint user_id_2 FK
        timestamp created_at
        timestamp updated_at
    }

    CONVERSATION {
        bigint id PK
        bigint user_id_1 FK
        bigint user_id_2 FK
        timestamp last_message_at
        timestamp created_at
        timestamp updated_at
    }

    MESSAGE {
        bigint id PK
        bigint conversation_id FK
        bigint sender_id FK
        text content
        varchar type
        varchar media_url
        boolean is_read
        timestamp created_at
        timestamp updated_at
    }

    EVENT {
        bigint id PK
        bigint creator_id FK
        varchar title
        text description
        varchar category
        varchar location
        decimal latitude
        decimal longitude
        timestamp start_datetime
        timestamp end_datetime
        int max_participants
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }

    EVENT_PARTICIPANT {
        bigint event_id FK
        bigint user_id FK
        varchar status
        timestamp joined_at
    }

    STORY {
        bigint id PK
        bigint user_id FK
        varchar media_url
        varchar caption
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    STORY_VIEW {
        bigint id PK
        bigint story_id FK
        bigint viewer_id FK
        timestamp viewed_at
    }

    NOTIFICATION {
        bigint id PK
        bigint user_id FK
        varchar type
        varchar title
        text body
        json data
        boolean is_read
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKEN {
        bigint id PK
        bigint user_id FK
        varchar token_hash UK
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    UNIVERSITY ||--o{ USER : "home_university"
    UNIVERSITY ||--o{ USER : "host_university"
    USER ||--o{ USER_INTEREST : "has"
    INTEREST ||--o{ USER_INTEREST : "has"
    USER ||--o{ USER_LANGUAGE : "speaks"
    LANGUAGE ||--o{ USER_LANGUAGE : "spoken_by"
    USER ||--o{ USER_PHOTO : "owns"
    USER ||--o{ FRIEND_REQUEST : "sends"
    USER ||--o{ FRIEND_REQUEST : "receives"
    USER ||--o{ FRIENDSHIP : "user1"
    USER ||--o{ FRIENDSHIP : "user2"
    USER ||--o{ CONVERSATION : "participant1"
    USER ||--o{ CONVERSATION : "participant2"
    CONVERSATION ||--o{ MESSAGE : "contains"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ EVENT : "creates"
    EVENT ||--o{ EVENT_PARTICIPANT : "has"
    USER ||--o{ EVENT_PARTICIPANT : "joins"
    USER ||--o{ STORY : "publishes"
    STORY ||--o{ STORY_VIEW : "viewed_by"
    USER ||--o{ STORY_VIEW : "views"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ REFRESH_TOKEN : "has"
```

## Notas de diseño

### Estrategias de indexación
- `user.email`: índice único para login O(1)
- `user.destination_city`, `user.destination_country`: índices para búsqueda por destino
- `user.home_university_id`, `user.host_university_id`: FK indexadas
- `friend_request(sender_id, receiver_id)`: índice compuesto único para evitar solicitudes duplicadas
- `friendship(user_id_1, user_id_2)`: índice compuesto único, siempre `user_id_1 < user_id_2`
- `message.conversation_id + created_at`: índice compuesto para paginación de mensajes
- `story.expires_at`: índice para limpieza de historias expiradas
- `notification(user_id, is_read)`: índice compuesto para notificaciones no leídas

### Convenciones
- Todas las tablas usan `BIGINT AUTO_INCREMENT` como PK
- Timestamps en UTC via `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- Borrado lógico preferido sobre físico (campo `is_active`)
- Enums almacenados como `VARCHAR` para flexibilidad
- JSON usado solo en `notification.data` para contexto dinámico
