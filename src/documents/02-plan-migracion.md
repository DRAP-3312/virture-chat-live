# Plan de Migracion: Widget Chat 2.0

## Stack Tecnologico

- **Vue 3** + Composition API + `<script setup lang="ts">`
- **TypeScript** estricto
- **Tailwind CSS v4** (ya compatible con Vite 7)
- **Lucide Vue Next** - Libreria de iconos (reemplaza SvgComponent.vue completo)
- **Socket.IO Client** - Misma libreria
- **DOMPurify** - Misma libreria
- **uuid** - Misma libreria
- **bad-words** - Misma libreria

## Mejoras Clave

1. **TypeScript completo** - Interfaces para mensajes, config, socket events
2. **Lucide icons** - Elimina SvgComponent.vue (600 lineas de SVG inline)
3. **Tailwind CSS v4** - Setup moderno, no PostCSS config separado
4. **Theme via CSS variables** - En lugar de 30+ props de colores, un objeto `theme`
5. **Store con defineStore pattern** - useMessages mas limpio
6. **Tipos para socket events** - Tipado de eventos emitidos/recibidos
7. **Menos componentes** - ChatBubble + ChatMessageContent se pueden fusionar

## Estructura Nueva

```
src/
├── main.ts                        # Entry point desarrollo
├── widget-entry.ts                # Entry point web component
├── App.vue                        # Componente raiz
├── assets/
│   └── sound/                     # Sonidos (copiar los mismos mp3)
├── components/
│   ├── ChatWidget.vue             # Panel principal del chat (fusiona Form + layout)
│   ├── ChatMessages.vue           # Lista de mensajes con scroll
│   ├── MessageBubble.vue          # Burbuja individual (fusiona Bubble + Content)
│   ├── MessageAttachment.vue      # Adjuntos (imagenes, PDFs, archivos)
│   ├── TypingIndicator.vue        # Indicador de escritura
│   └── WelcomeModal.vue           # Modal de bienvenida (extraido de App.vue)
├── composables/
│   ├── useSocket.ts               # Conexion Socket.IO tipada
│   ├── useChatStore.ts            # Estado global del chat
│   ├── useSessionMetrics.ts       # Metricas del navegador/dispositivo
│   ├── useSound.ts                # Sonidos de notificacion
│   └── useUtm.ts                  # Captura UTM params
├── types/
│   ├── chat.ts                    # Interfaces: Message, Attachment, ChatTheme, WidgetConfig
│   └── socket-events.ts           # Tipos de eventos socket
├── utils/
│   ├── analytics.ts               # Google Analytics / dataLayer
│   ├── bad-words-es.ts            # Lista de palabras
│   ├── markdown.ts                # Parseo de markdown/links/imagenes
│   └── sanitize.ts                # DOMPurify wrapper
└── documents/                     # Documentacion
```

## Pasos de Implementacion

### Paso 1: Configuracion del proyecto
- [x] Proyecto Vue 3 + TypeScript + Vite creado
- [ ] Instalar dependencias: tailwindcss, socket.io-client, uuid, dompurify, bad-words, lucide-vue-next
- [ ] Configurar Tailwind CSS v4
- [ ] Copiar archivos de sonido

### Paso 2: Tipos e interfaces
- [ ] Crear types/chat.ts (Message, Attachment, ChatTheme, WidgetConfig, CustomStyle)
- [ ] Crear types/socket-events.ts (eventos emitidos y recibidos)

### Paso 3: Utils
- [ ] Migrar analytics.ts (dataLayer.js -> TypeScript)
- [ ] Migrar bad-words-es.ts
- [ ] Crear markdown.ts (extraer logica de ChatMessageContent)
- [ ] Crear sanitize.ts (wrapper DOMPurify)

### Paso 4: Composables
- [ ] Migrar useChatStore.ts (useMessages.js -> TypeScript + tipado)
- [ ] Migrar useSocket.ts (socket-connection.js -> TypeScript + tipado)
- [ ] Migrar useSessionMetrics.ts
- [ ] Migrar useSound.ts (fusionar useSound + soundInstance)
- [ ] Migrar useUtm.ts

### Paso 5: Componentes
- [ ] WelcomeModal.vue (extraer del App.vue original)
- [ ] TypingIndicator.vue (TypingLoader.vue -> Tailwind puro)
- [ ] MessageBubble.vue (fusionar ChatBubbleComponent + ChatMessageContent)
- [ ] MessageAttachment.vue (AttachmentComponent.vue -> con Lucide icons)
- [ ] ChatMessages.vue (lista de mensajes agrupados por fecha)
- [ ] ChatWidget.vue (FormComponent.vue -> panel principal)
- [ ] App.vue (raiz, con theme simplificado)

### Paso 6: Build configuration
- [ ] Configurar vite.config.ts para build de libreria
- [ ] Crear widget-entry.ts (defineCustomElement)
- [ ] Verificar build production

## Mapeo de Componentes Original -> Nuevo

| Original | Nuevo | Notas |
|----------|-------|-------|
| App.vue | App.vue | Simplificado, theme como objeto |
| FormComponent.vue | ChatWidget.vue | Rename + TypeScript |
| ChatBubbleComponent.vue | ChatMessages.vue | Rename, logica agrupacion aqui |
| ChatMessageContent.vue | MessageBubble.vue | Fusionado con bubble |
| AttachmentComponent.vue | MessageAttachment.vue | Lucide icons |
| SvgComponent.vue | ELIMINADO | Reemplazado por Lucide |
| TypingLoader.vue | TypingIndicator.vue | Solo Tailwind |
| ChatWidget.js | widget-entry.ts | TypeScript |
| (parte de App.vue) | WelcomeModal.vue | Extraido como componente |
