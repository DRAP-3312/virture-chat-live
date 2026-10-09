import { createApp, h } from 'vue'
import App from './App.vue'
import type { WidgetProps } from './types/props'

// Solo modo dev (la libreria se construye desde src/index.ts).
// Prioridad: query string > variables VITE_* (.env.local) > defaults de App.vue.
//   http://localhost:5173/?apiKey=...&idAgent=...&socketUrl=http://localhost:7777
//   Opcionales: nameSpace, instanceName, gaTrackingId
const query = new URLSearchParams(window.location.search)
const env = import.meta.env

function pick(queryKey: string, envValue: string | undefined) {
  return query.get(queryKey) || envValue || undefined
}

const devProps: WidgetProps = {
  apiKey: pick('apiKey', env.VITE_API_KEY),
  idAgent: pick('idAgent', env.VITE_ID_AGENT),
  socketUrl: pick('socketUrl', env.VITE_SOCKET_URL),
  nameSpace: pick('nameSpace', env.VITE_NAME_SPACE),
  instanceName: pick('instanceName', env.VITE_INSTANCE_NAME),
  gaTrackingId: pick('gaTrackingId', env.VITE_GA_TRACKING_ID),
}

// Quita las props sin valor para que apliquen los defaults
const definedProps = Object.fromEntries(
  Object.entries(devProps).filter(([, v]) => v !== undefined),
)

createApp({ render: () => h(App, definedProps) }).mount('#app')
