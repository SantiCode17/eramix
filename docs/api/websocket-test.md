# WebSocket Testing Guide — EraMix Chat

## Arquitectura

```
Cliente A (STOMP/SockJS)              Servidor Spring Boot              Cliente B (STOMP/SockJS)
         │                                    │                                   │
         ├── CONNECT /ws?token=JWT_A ────────►│                                   │
         │◄──── CONNECTED ───────────────────│                                   │
         ├── SUBSCRIBE /user/A/queue/messages►│                                   │
         │                                    │◄── CONNECT /ws?token=JWT_B ───────┤
         │                                    │──── CONNECTED ──────────────────►│
         │                                    │◄── SUBSCRIBE /user/B/queue/msgs ──┤
         │                                    │                                   │
         ├── SEND /app/chat.sendMessage ─────►│                                   │
         │   {conversationId, content, type}  │── persist to MySQL                │
         │                                    │── send notification               │
         │◄── MESSAGE (confirmación) ─────────│                                   │
         │                                    │── MESSAGE (nuevo msg) ───────────►│
```

## 1. Obtener Token JWT

```bash
# Registrar usuario A
curl -X POST http://localhost:8090/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "userA@test.com",
    "password": "Test1234!",
    "firstName": "User",
    "lastName": "A",
    "dateOfBirth": "2000-01-01"
  }'

# Registrar usuario B
curl -X POST http://localhost:8090/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "userB@test.com",
    "password": "Test1234!",
    "firstName": "User",
    "lastName": "B",
    "dateOfBirth": "2000-01-01"
  }'
```

Guardar los `accessToken` de ambas respuestas.

## 2. Crear Amistad (genera Conversación automáticamente)

```bash
# User A envía solicitud de amistad a User B
TOKEN_A="<access_token_user_a>"
curl -X POST http://localhost:8090/api/v1/friends/requests \
  -H "Authorization: Bearer $TOKEN_A" \
  -H 'Content-Type: application/json' \
  -d '{"receiverId": <USER_B_ID>}'

# User B acepta la solicitud (esto crea la Conversation automáticamente)
TOKEN_B="<access_token_user_b>"
curl -X PUT http://localhost:8090/api/v1/friends/requests/<REQUEST_ID> \
  -H "Authorization: Bearer $TOKEN_B" \
  -H 'Content-Type: application/json' \
  -d '{"action": "ACCEPTED"}'
```

## 3. Verificar Conversación Creada

```bash
curl http://localhost:8090/api/v1/conversations \
  -H "Authorization: Bearer $TOKEN_A"
```

Anotar el `id` de la conversación.

## 4. Conectar al WebSocket (con Postman o wscat)

### Usando Postman WebSocket

1. Abrir nueva pestaña **WebSocket** en Postman
2. URL: `ws://localhost:8090/ws/websocket`
3. En la sección de conexión, añadir parámetro de query: `token=<JWT>`
4. Usar protocolo STOMP

### Usando un cliente STOMP JavaScript (navegador)

```html
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7/bundles/stomp.umd.min.js"></script>
<script>
  const TOKEN = '<JWT_ACCESS_TOKEN>';
  const USER_ID = '<YOUR_USER_ID>';

  const socket = new SockJS(`http://localhost:8090/ws?token=${TOKEN}`);
  const stompClient = new StompJs.Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
  });

  stompClient.onConnect = (frame) => {
    console.log('✅ Conectado:', frame);

    // Suscribirse a mensajes personales
    stompClient.subscribe(`/user/${USER_ID}/queue/messages`, (message) => {
      const msg = JSON.parse(message.body);
      console.log('📩 Mensaje recibido:', msg);
    });
  };

  stompClient.activate();

  // Función para enviar mensaje
  function sendMessage(conversationId, content) {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        conversationId: conversationId,
        content: content,
        type: 'TEXT'
      })
    });
  }
</script>
```

## 5. Enviar Mensaje de Prueba

### Desde el cliente STOMP:

Destino: `/app/chat.sendMessage`

Payload:
```json
{
  "conversationId": 1,
  "content": "¡Hola desde WebSocket! 👋",
  "type": "TEXT"
}
```

### Respuesta esperada (en /user/{userId}/queue/messages):

```json
{
  "id": 1,
  "conversationId": 1,
  "senderId": 5,
  "senderFirstName": "User",
  "senderLastName": "A",
  "content": "¡Hola desde WebSocket! 👋",
  "type": "TEXT",
  "mediaUrl": null,
  "isRead": false,
  "createdAt": "2026-03-30T17:45:00Z"
}
```

## 6. Verificar Persistencia (REST)

```bash
# Obtener mensajes de la conversación
curl "http://localhost:8090/api/v1/conversations/1/messages?size=30" \
  -H "Authorization: Bearer $TOKEN_A"

# Marcar como leídos
curl -X PUT "http://localhost:8090/api/v1/conversations/1/read" \
  -H "Authorization: Bearer $TOKEN_B"
```

## 7. Verificar Presencia Online

Las respuestas de `GET /conversations` incluyen `otherUserOnline: true/false`, indicando si el otro usuario tiene una sesión WebSocket activa.

## Notas de Seguridad

- El handshake WebSocket requiere JWT válido en `?token=<JWT>`
- Conexiones sin token o con token expirado son rechazadas (código 401)
- Solo los participantes de una conversación pueden enviar/leer mensajes
- Los mensajes se persisten en MySQL antes de ser reenviados
