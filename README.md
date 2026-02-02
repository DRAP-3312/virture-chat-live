# virture-chat-live

Widget de chat en vivo para Vue 3, con conexion via Socket.IO.

## Instalacion

```bash
npm install virture-chat-live
```

## Uso basico

```vue
<script setup>
import { ChatWidget } from "virture-chat-live";
import "virture-chat-live/style.css";
</script>

<template>
  <ChatWidget
    :socket-url="widgetConfig.socketUrl"
    :id-agent="widgetConfig.idAgent"
    :api-key="widgetConfig.apiKey"
    :name-space="widgetConfig.nameSpace"
    :instance-name="widgetConfig.instanceName"
    :gaTrackingId="''"
  />
</template>
```

## Props

| Prop                     | Tipo                 | Default            | Descripcion                              |
| ------------------------ | -------------------- | ------------------ | ---------------------------------------- |
| `socket-url`             | `string`             | —                  | URL del servidor Socket.IO               |
| `id-agent`               | `string`             | —                  | ID del agente                            |
| `api-key`                | `string`             | —                  | API key de autenticacion                 |
| `name-space`             | `string`             | `"/chat"`          | Namespace de Socket.IO                   |
| `welcome-message`        | `string`             | `"Hola que tal"`   | Mensaje de bienvenida                    |
| `welcome-message-button` | `string`             | `"Chatear Ahora!"` | Texto del boton de bienvenida            |
| `icon-button`            | `string`             | —                  | URL de icono personalizado para el boton |
| `sound-name`             | `string`             | `"sound1"`         | Nombre del sonido de notificacion        |
| `instance-name`          | `string`             | —                  | Nombre de la instancia                   |
| `ga-tracking-id`         | `string`             | —                  | ID de Google Analytics                   |
| `theme`                  | `Partial<ChatTheme>` | —                  | Objeto para personalizar colores         |
| `position`               | `WidgetPosition`     | —                  | Posicion del widget                      |

## Personalizar tema

```vue
<ChatWidget
  socket-url="https://tu-servidor.com"
  id-agent="tu-agent-id"
  api-key="tu-api-key"
  :theme="{
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    accentColor: '#e94560',
    userMessageBackground: '#e94560',
    userMessageTextColor: '#ffffff',
    botMessageBackground: '#16213e',
    botMessageTextColor: '#ffffff',
  }"
/>
```

## Posicion personalizada

```vue
<ChatWidget
  socket-url="https://tu-servidor.com"
  id-agent="tu-agent-id"
  api-key="tu-api-key"
  :position="{
    mode: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
  }"
/>
```

Modos disponibles: `fixed`, `absolute`, `relative`.

## Tipos exportados

```ts
import type { ChatTheme, WidgetPosition, WidgetProps } from "virture-chat-live";
```

## Desarrollo

```bash
npm run dev         # servidor de desarrollo
npm run build:lib   # build para npm
npm publish         # publicar en npm
```
