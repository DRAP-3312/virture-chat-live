export interface ChatMessage {
  _id?: string
  content: string
  role: 'user' | 'agent'
  createdAt?: string
  attachments?: Attachment[]
  deleteMarker?: boolean
}

export interface Attachment {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface ChatTheme {
  welcomeBackgroundColor: string
  welcomeTextColor: string
  welcomeButtonColor: string
  welcomeButtonHoverColor: string
  chatPanelBackground: string
  chatHeaderBackground: string
  chatHeaderTextColor: string
  chatMessagesBackground: string
  chatInputBackground: string
  chatInputTextColor: string
  chatInputBorderColor: string
  sendButtonBackground: string
  sendButtonHoverBackground: string
  userMessageBackground: string
  userMessageTextColor: string
  botMessageBackground: string
  botMessageTextColor: string
}

export interface CustomStyle extends Partial<ChatTheme> {
  welcomeMessage?: string
  welcomeMessageButton?: string
  svgName?: string
  soundName?: string
  icon_button_url?: string
  visibility_welcome_modal?: boolean
  btn_close_welcome_modal?: boolean
  time_active_welcome_modal?: number
}

export interface WidgetProps {
  socketUrl: string
  idAgent: string
  apiKey: string
  nameSpace: string
  gaTrackingId?: string
  welcomeMessage?: string
  iconButton?: string
  welcomeMessageButton?: string
  soundName?: string
  instanceName?: string
  theme?: Partial<ChatTheme>
}

export const DEFAULT_THEME: ChatTheme = {
  welcomeBackgroundColor: '#333',
  welcomeTextColor: '#fff',
  welcomeButtonColor: '#007bff',
  welcomeButtonHoverColor: '#0056b3',
  chatPanelBackground: '#ffffff',
  chatHeaderBackground: '#131844',
  chatHeaderTextColor: '#ffffff',
  chatMessagesBackground: '#f8f9fc',
  chatInputBackground: '#ffffff',
  chatInputTextColor: '#474747',
  chatInputBorderColor: '#ccc',
  sendButtonBackground: '#131844',
  sendButtonHoverBackground: '#1a205a',
  userMessageBackground: '#15be86',
  userMessageTextColor: '#ffffff',
  botMessageBackground: '#f5f5f5',
  botMessageTextColor: '#3f3f3f',
}
