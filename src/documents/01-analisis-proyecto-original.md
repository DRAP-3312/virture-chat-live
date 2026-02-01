# Analisis del Proyecto Original: chat-live-vue

## Resumen General

Widget de chat en vivo construido con Vue 3 + Vite, distribuido como libreria npm y web component.
Usa Socket.IO para comunicacion en tiempo real, tiene personalizacion de estilos via props,
integracion con Google Analytics, sonidos de notificacion, y metricas de sesion.

---

## Estructura de Archivos

```
chat-live-vue/
├── src/
│   ├── main.js                    # Entry point desarrollo
│   ├── widget-entry.js            # Entry point web component (produccion)
│   ├── App.vue                    # Componente raiz del widget
│   ├── assets/
│   │   ├── style.css              # Estilos globales
│   │   ├── vue.svg                # Logo de Vue
│   │   └── sound/                 # Sonidos de notificacion (sound1-5.mp3)
│   ├── components/
│   │   ├── ChatWidget.js          # Wrapper web component (defineCustomElement)
│   │   ├── FormComponent.vue      # Panel principal del chat (header, mensajes, input)
│   │   ├── ChatBubbleComponent.vue# Contenedor de burbujas de mensajes
│   │   ├── ChatMessageContent.vue # Renderizado de contenido (markdown, links, imagenes)
│   │   ├── AttachmentComponent.vue# Visualizacion de archivos adjuntos
│   │   ├── SvgComponent.vue       # Iconos SVG inline (hello, send, restart, etc.)
│   │   ├── TypingLoader.vue       # Indicador "esta escribiendo"
│   │   └── widget/
│   │       └── Widget.vue         # Componente experimental simplificado (no usado en produccion)
│   ├── composable/
│   │   ├── socket-connection.js   # Conexion Socket.IO + tracking + metricas (exporta useSocketConnection)
│   │   ├── useMessages.js         # Estado global de mensajes (exporta useChatMessages)
│   │   ├── useSessionMetrics.js   # Info del navegador, OS, ubicacion
│   │   ├── useSound.js            # Reproduccion de sonidos
│   │   ├── soundInstance.js       # Singleton del composable de sonido (exporta playSound)
│   │   ├── compare-objects.js     # Deep equal para objetos (exporta areObjectsDeepEqual)
│   │   └── get_utm.js             # Captura de parametros UTM
│   └── utils/
│       ├── dataLayer.js           # Google Analytics / GTM integration
│       └── bad-words-spanish.js   # Lista de palabras prohibidas en espanol
├── tailwind.config.cjs            # Configuracion de Tailwind CSS
├── postcss.config.cjs             # Configuracion de PostCSS
└── vite.config.js                 # Configuracion de Vite
```

---

## Dependencias Originales

### Produccion
- `vue` ^3.5.13
- `socket.io-client` ^4.8.1 - Comunicacion en tiempo real
- `uuid` ^11.1.0 - Generacion de IDs de usuario
- `dompurify` ^3.2.5 - Sanitizacion de HTML
- `bad-words` ^4.0.0 - Filtro de palabras ofensivas

### Desarrollo
- `vite` ^6.2.0 - Bundler y dev server
- `@vitejs/plugin-vue` ^5.2.1 - Plugin de Vue para Vite
- `tailwindcss` ^3.4.17 - Framework CSS utility-first
- `postcss` ^8.5.6 - Procesador CSS
- `autoprefixer` ^10.4.21 - Auto prefijos CSS

---

## Flujo Principal del Widget

### 1. Inicializacion
- `App.vue` recibe props de configuracion (socketUrl, idAgent, api_key, nameSpace, colores, etc.)
- Se inicializa la conexion Socket.IO via el composable `useSocketConnection()` de `socket-connection.js`
- Se capturan UTMs de la URL actual via `get_utm()`
- Se configuran intervalos para: tracking de navegacion (2s), config del widget (1s), metricas (10s)

### 2. Welcome Flow
- Tras 1s aparece indicador de typing
- Tras 3.5s aparece modal de bienvenida con mensaje configurable
- Auto-dismiss configurable via `time_active_welcome_modal`
- El boton del chat tiene animacion bounce

### 3. Conexion Socket.IO
**Eventos emitidos:**
- `connected-chat` - Al conectar, envia UTMs, recibe historial de mensajes
- `send-chat-message` - Envia mensaje del usuario
- `typing-user-state` - Estado de escritura del usuario
- `navigation-path-chat` - Tracking de paginas visitadas
- `get-custom-widget` - Solicita configuracion personalizada del widget
- `metrics-chat` - Envia metricas del cliente

**Eventos escuchados:**
- `response` - Mensaje del bot/agente
- `lead-registered` - Lead registrado
- `scheduled_appointment` - Cita agendada
- `typing-state-widget` - Estado de escritura del bot
- `delete-message` - Eliminacion de mensajes

### 4. Estado Global (useChatMessages)
Variables reactivas compartidas (patron singleton) exportadas por `useChatMessages()`:
- `messages` - Array de mensajes
- `openChat` - Estado abierto/cerrado del chat
- `custom_style` - Estilos personalizados del servidor
- `typingState` - Estado de typing del bot
- `closeModalOption` - Control de modal de opciones
- `stateBtnAlerts` / `stateBtnUbication` - Estado de permisos
- `deleteMessages()` - Marca mensajes como eliminados (deleteMarker)

### 5. Renderizado de Mensajes
- Mensajes agrupados por fecha (Hoy, Ayer, fecha completa)
- Soporte para markdown basico: **bold**, links, imagenes
- Sanitizacion con DOMPurify
- Soporte para adjuntos: imagenes, PDFs, otros archivos
- Filtro de palabras ofensivas (bad-words + lista en espanol)

### 6. Metricas de Sesion
Recolecta:
- Browser y version
- OS y tipo de dispositivo
- Resolucion de pantalla
- Ubicacion (geolocation API + fallback a ipapi.co)
- Referrer

### 7. Google Analytics
- Detecta si hay GTM activo
- Si no hay GTM, inicializa GA4 directamente
- Eventos: session_started, widget_opened, widget_closed, message_sent_client, lead_registered, scheduled_appointment

---

## Props Configurables (App.vue)

| Prop | Default | Descripcion |
|------|---------|-------------|
| socketUrl | localhost:7777 | URL del servidor Socket.IO |
| idAgent | - | ID del agente |
| api_key | - | API key |
| nameSpace | /conversation | Namespace de Socket.IO |
| gaTrackingId | - | Google Analytics ID |
| welcomeMessage | - | Mensaje de bienvenida |
| iconButton | - | URL del icono del boton |
| svgName | - | Nombre del icono SVG a usar |
| soundName | sound1 | Sonido de notificacion |
| instanceName | Dev V2 | Nombre de la instancia |
| welcomeBackgroundColor | #333 | Color fondo bienvenida |
| welcomeTextColor | #fff | Color texto bienvenida |
| welcomeButtonColor | #007bff | Color boton bienvenida |
| chatHeaderBackground | #131844 | Color fondo header |
| chatHeaderTextColor | #ffffff | Color texto header |
| chatPanelBackground | #ffffff | Color fondo panel |
| chatInputBackground | #ffffff | Color fondo input |
| userMessageBackground | #15be86 | Color fondo msg usuario |
| botMessageBackground | #f5f5f5 | Color fondo msg bot |
| ...y mas colores... | | |

---

## Problemas Identificados del Proyecto Original

1. **Sin TypeScript** - Todo en JavaScript plano, sin tipos
2. **SVGs inline gigantes** - SvgComponent.vue tiene 600+ lineas de SVGs hardcodeados
3. **Estilos duplicados** - `@tailwind` repetido en cada componente
4. **Deep equal manual** - compare-objects.js reimplementa lodash.isEqual (exporta `areObjectsDeepEqual`)
5. **Singleton informal** - useChatMessages usa refs a nivel de modulo (funciona pero no es idiomatico)
6. **Props excesivas** - App.vue tiene 30+ props de colores que se pasan en cascada
7. **No hay manejo de errores robusto** - Socket no tiene retry personalizado
8. **Web Component config comentada** - Dual config en vite.config.js
9. **Componente experimental sin usar** - Widget.vue en components/widget/ no se usa en produccion
10. **Archivos .cjs** - tailwind.config.cjs y postcss.config.cjs usan CommonJS en lugar de ESM

## Notas Adicionales

- **soundInstance.js**: Exporta un singleton con el metodo `playSound` para reproducir notificaciones
- **socket-connection.js**: Exporta `useSocketConnection` (no `socketConnection`)
- **useMessages.js**: Exporta `useChatMessages` (no `useMessages`)
- **Vite version**: Usa Vite 6.2.0 (no 7.x)
