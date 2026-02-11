# virture-chat-live

Widget de chat en vivo para Vue 3, con conexion via Socket.IO.

Se puede usar de dos formas: como **componente Vue** o como **Web Component** con Shadow DOM.

## Instalacion

```bash
npm install virture-chat-live
```

---

## Opcion 1: Componente Vue

Ideal para proyectos Vue 3 o Nuxt 3. Se integra directamente en tu aplicacion.

```vue
<script setup>
import { ChatWidget } from "virture-chat-live";
import "virture-chat-live/style.css";
</script>

<template>
  <ChatWidget
    socket-url="https://tu-servidor.com"
    id-agent="tu-agent-id"
    api-key="tu-api-key"
    name-space="/chat"
  />
</template>
```

### Nuxt 3

Crea un wrapper client-only en `components/ChatWidgetWrapper.client.vue`:

```vue
<script setup>
import { ChatWidget } from "virture-chat-live";
import "virture-chat-live/style.css";

const props = defineProps({
  socketUrl: String,
  idAgent: String,
  apiKey: String,
  nameSpace: { type: String, default: "/chat" },
});
</script>

<template>
  <ChatWidget
    :socket-url="socketUrl"
    :id-agent="idAgent"
    :api-key="apiKey"
    :name-space="nameSpace"
  />
</template>
```

Usalo en cualquier pagina:

```vue
<template>
  <ChatWidgetWrapper
    socket-url="https://tu-servidor.com"
    id-agent="tu-agent-id"
    api-key="tu-api-key"
  />
</template>
```

El sufijo `.client.vue` garantiza que solo se renderiza en el cliente (compatible con SSR).

---

## Opcion 2: Web Component (Shadow DOM)

Ideal cuando necesitas **aislamiento total de estilos**. Los CSS del sitio no afectan al widget y viceversa.

### HTML puro

```html
<script type="module">
  import "virture-chat-live/widget";
</script>

<vue-chat-widget
  socket-url="https://tu-servidor.com"
  id-agent="tu-agent-id"
  api-key="tu-api-key"
  name-space="/chat"
></vue-chat-widget>
```

### Nuxt 3

1. Configura `nuxt.config.ts` para que Vue reconozca el custom element:

```typescript
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === "vue-chat-widget",
    },
  },
});
```

2. Crea el plugin `plugins/chat-widget.client.ts`:

```typescript
export default defineNuxtPlugin(() => {
  import("virture-chat-live/widget");
});
```

3. Usalo en cualquier pagina:

```vue
<template>
  <vue-chat-widget
    socket-url="https://tu-servidor.com"
    id-agent="tu-agent-id"
    api-key="tu-api-key"
    name-space="/chat"
  />
</template>
```

> **Nota:** Con el Web Component las props se pasan como atributos HTML (strings). Para props complejas como `theme` o `position`, pasa un JSON string: `:position='JSON.stringify({ mode: "fixed", bottom: "20px" })'`.

---

## Diferencias entre ambas opciones

| | Componente Vue | Web Component |
| --- | --- | --- |
| **Aislamiento CSS** | Parcial (scoped) | Total (Shadow DOM) |
| **Props** | Reactivas (objetos, arrays) | Solo strings (atributos HTML) |
| **SSR** | Compatible | Solo client-side |
| **Frameworks** | Solo Vue 3 / Nuxt 3 | Cualquiera (React, Angular, HTML, etc.) |

---

## Props

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `socket-url` | `string` | — | URL del servidor Socket.IO |
| `id-agent` | `string` | — | ID del agente |
| `api-key` | `string` | — | API key de autenticacion |
| `name-space` | `string` | `"/chat"` | Namespace de Socket.IO |
| `welcome-message` | `string` | `"Bienvenido"` | Mensaje de bienvenida |
| `welcome-message-button` | `string` | `"Chatear Ahora!"` | Texto del boton de bienvenida |
| `icon-button` | `string` | — | URL de icono personalizado para el boton |
| `sound-name` | `string` | `"sound1"` | Nombre del sonido de notificacion |
| `instance-name` | `string` | — | Nombre de la instancia |
| `ga-tracking-id` | `string` | — | ID de Google Analytics |
| `theme` | `Partial<ChatTheme>` | — | Objeto para personalizar colores |
| `position` | `WidgetPosition` | — | Posicion del widget |

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
