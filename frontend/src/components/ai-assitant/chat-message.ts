// Message interface - main interface
export interface ChatMessage {
  conversationId: string;
  messageId: string;
  message: Message;
  stageId?: number;
}

export interface Message {
  role: RoleType;
  content: string;
  multiContent?: ChatMessagePart[];
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  toolName?: string;
  responseMeta?: ResponseMeta;
  reasoning_content?: string;
  extra?: Record<string, any>; // messageId and parentId are now stored here
}

// Role type enum
export enum RoleType {
  Assistant = "assistant",
  User = "user",
  System = "system",
  Tool = "tool",
}

// Chat message part type enum
export enum ChatMessagePartType {
  Text = "text",
  ImageURL = "image_url",
  AudioURL = "audio_url",
  VideoURL = "video_url",
  FileURL = "file_url",
}

// Chat message audio URL interface
export interface ChatMessageAudioURL {
  url?: string;
  uri?: string;
  mimeType?: string;
  extra?: Record<string, any>;
}

// Chat message video URL interface
export interface ChatMessageVideoURL {
  url?: string;
  uri?: string;
  mimeType?: string;
  extra?: Record<string, any>;
}

// Chat message file URL interface
export interface ChatMessageFileURL {
  url?: string;
  uri?: string;
  mimeType?: string;
  name?: string;
  extra?: Record<string, any>;
}

// Image URL detail enum
export enum ImageURLDetail {
  High = "high",
  Low = "low",
  Auto = "auto",
}

// Chat message image URL interface
export interface ChatMessageImageURL {
  url?: string;
  uri?: string;
  detail?: ImageURLDetail;
  mimeType?: string;
  extra?: Record<string, any>;
}

// Chat message part interface
export interface ChatMessagePart {
  type?: ChatMessagePartType;
  text?: string;
  imageURL?: ChatMessageImageURL;
  audioURL?: ChatMessageAudioURL;
  videoURL?: ChatMessageVideoURL;
  fileURL?: ChatMessageFileURL;
  extra?: Record<string, any>;
}

// Function call interface
export interface FunctionCall {
  name?: string;
  arguments?: string;
}

// Tool call interface
export interface ToolCall {
  index?: number;
  id: string;
  type: string;
  function: FunctionCall;
  extra?: Record<string, any>;
}

// Prompt token details interface
export interface PromptTokenDetails {
  cachedTokens: number;
}

// Token usage interface
export interface TokenUsage {
  promptTokens: number;
  promptTokenDetails: PromptTokenDetails;
  completionTokens: number;
  totalTokens: number;
}

// Top log probability interface
export interface TopLogProb {
  token: string;
  logprob: number;
  bytes?: number[];
}

// Log probability item interface
export interface LogProb {
  token: string;
  logprob: number;
  bytes?: number[];
  topLogProbs: TopLogProb[];
}

// Log probabilities interface
export interface LogProbs {
  content: LogProb[];
}

// Response metadata interface
export interface ResponseMeta {
  finishReason?: string;
  usage?: TokenUsage;
  logProbs?: LogProbs;
}
