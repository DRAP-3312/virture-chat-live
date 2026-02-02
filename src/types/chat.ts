export interface ChatMessage {
  _id?: string;
  content: string;
  role: "user" | "agent";
  createdAt?: string;
  attachments?: Attachment[];
  deleteMarker?: boolean;
}

export interface Attachment {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface ChatTheme {
  backgroundColor: string; // Fondo general del widget (header, body, input)
  textColor: string; // Texto general (header, welcome, inputs)
  accentColor: string; // Botones y elementos interactivos
  userMessageBackground: string; // Fondo de mensajes del usuario
  userMessageTextColor: string; // Texto de mensajes del usuario
  botMessageBackground: string; // Fondo de mensajes del bot
  botMessageTextColor: string; // Texto de mensajes del bot
}

export interface CustomStyle extends Partial<ChatTheme> {
  welcomeMessage?: string;
  welcomeMessageButton?: string;
  svgName?: string;
  soundName?: string;
  icon_button_url?: string;
  visibility_welcome_modal?: boolean;
  btn_close_welcome_modal?: boolean;
  time_active_welcome_modal?: number;
}

export type PositionMode = "fixed" | "absolute" | "relative";

export interface WidgetPosition {
  mode?: PositionMode;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
}

export const DEFAULT_THEME: ChatTheme = {
  backgroundColor: "#131844", // Fondo principal del widget (header, body, input)
  textColor: "#ffffff", // Texto general (header, inputs)
  accentColor: "#007bff", // Botones y elementos interactivos
  userMessageBackground: "#15be86", // Fondo de mensajes del usuario (verde)
  userMessageTextColor: "#ffffff", // Texto de mensajes del usuario (blanco)
  botMessageBackground: "#f5f5f5", // Fondo de mensajes del bot (gris claro)
  botMessageTextColor: "#3f3f3f", // Texto de mensajes del bot (gris oscuro)
};
