// AI 모델 타입 정의
export type AIModel = "claude" | "chatgpt" | "gemini";

// AI 제공자 설정
export interface AIModelConfig {
  id: AIModel;
  name: string;
  credits: number;
  badge?: string;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: "gemini",
    name: "Gemini 3 Pro",
    credits: 1,
    badge: "Recommend",
  },
  {
    id: "chatgpt",
    name: "GPT-5.1",
    credits: 1,
  },
  {
    id: "claude",
    name: "Claude Opus 4.5",
    credits: 2,
  },
];

// 모델별 크레딧 비용 조회
export function getModelCredits(model: AIModel): number {
  const config = AI_MODELS.find((m) => m.id === model);
  return config?.credits ?? 1;
}

// 파일 시스템 인터페이스
export interface FileSystem {
  [filePath: string]: string;
}

// 첨부 파일 인터페이스
export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
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
  attachments?: FileAttachment[];
}

// 채팅 응답 인터페이스
export interface ChatResponse {
  response: string;
  fileChanges?: FileSystem;
}
