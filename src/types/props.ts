import type {
  Attachment,
  ChatMessage,
  ChatTheme,
  WidgetPosition,
} from "./chat";

export interface WidgetProps {
  socketUrl?: string;
  idAgent?: string;
  apiKey?: string;
  nameSpace?: string;
  gaTrackingId?: string;
  welcomeMessage?: string;
  iconButton?: string;
  welcomeMessageButton?: string;
  soundName?: string;
  instanceName?: string;
  theme?: Partial<ChatTheme>;
  position?: WidgetPosition | string;
}

export interface ChatHeaderProps {
  instanceName?: string;
  iconButtonUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  socketState: boolean;
}

export interface ChatMessageProps {
  backgroundColor: string;
  textColor: string;
  userMessageBackground: string;
  userMessageTextColor: string;
  botMessageBackground: string;
  botMessageTextColor: string;
  iconButtonUrl?: string;
  instanceName?: string;
}

export interface SocketLike {
  emit: (event: string, ...args: unknown[]) => unknown;
  on: (event: string, callback: (...args: unknown[]) => void) => unknown;
}

export interface FormChatProps {
  socket: SocketLike;
  sendMetricsNow: () => void;
  idAgent: string;
  apiKey: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  userMessageBackground: string;
  userMessageTextColor: string;
  botMessageBackground: string;
  botMessageTextColor: string;
  instanceName?: string;
  iconButtonUrl?: string;
  socketState: boolean;
}

export interface DateSepatorProps {
  date: string;
  textColor: string;
  backgroundColor: string;
}

export interface MessageAttachmentProps {
  attachment: Attachment;
  isMultiple?: boolean;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  textColor: string;
  userMessageBackground: string;
  userMessageTextColor: string;
  botMessageBackground: string;
  botMessageTextColor: string;
  iconButtonUrl?: string;
  instanceName?: string;
}

export interface MessageInputProps {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  modelValue: string;
}

export interface PermissionButtonsProps {
  textColor: string;
  accentColor: string;
  stateBtnUbication: boolean;
  stateBtnAlerts: boolean;
}

export interface TypeIndicatorProps {
  instanceName?: string;
  iconButtonUrl?: string;
  botMessageBackground?: string;
  botMessageTextColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface WelcomeModalProps {
  message: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  showCloseButton: boolean;
}

export interface ToolTipProps {
  position?: "top" | "bottom";
}
