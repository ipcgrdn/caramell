// AI 모델 타입 정의
export type AIModel = "claude" | "chatgpt" | "gemini";

// AI 제공자 설정
export interface AIModelConfig {
  id: AIModel;
  name: string;
  badge?: string;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: "claude",
    name: "Claude 4.5 Opus",
  },
  {
    id: "gemini",
    name: "Gemini 3 Pro",
  },
  {
    id: "chatgpt",
    name: "GPT-5.1",
  },
];

// 파일 시스템 인터페이스
export interface FileSystem {
  [filePath: string]: string;
}

// 생성 결과 인터페이스
export interface GenerationResult {
  files: FileSystem;
  message: string;
}

// 채팅 메시지 인터페이스
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// 채팅 응답 인터페이스
export interface ChatResponse {
  response: string;
  fileChanges?: FileSystem;
}
