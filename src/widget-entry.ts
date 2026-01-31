import { defineCustomElement } from 'vue'
import App from './App.vue'
import './style.css'

const ChatElement = defineCustomElement(App as any)

customElements.define('vue-chat-widget', ChatElement)

export default ChatElement
