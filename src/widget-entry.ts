import { defineCustomElement } from 'vue'
import App from './App.vue'
import baseStyles from './style.css?inline'

const ChatElement = defineCustomElement(App as any, {
  styles: [baseStyles],
})

customElements.define('vue-chat-widget', ChatElement)

export default ChatElement
