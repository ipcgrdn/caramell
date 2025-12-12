import { AIModel, FileSystem, ChatMessage, ChatResponse, FileAttachment } from "./aiTypes";

import { chatWithClaudeStream } from "./aiModels/claude";
import { chatWithOpenAIStream } from "./aiModels/openai";
import { chatWithGeminiStream } from "./aiModels/gemini";

/**
 * 스트리밍 채팅 기반 코드 수정 함수
 *
 * @param userMessage - 사용자의 수정 요청 메시지
 * @param currentFiles - 현재 프로젝트 파일들 (FileSystem 객체)
 * @param chatHistory - 이전 대화 히스토리 (컨텍스트 유지용)
 * @param model - 사용할 AI 모델 (기본값: "gemini")
 * @param attachments - 첨부 파일들 (선택적)
 * @returns AsyncGenerator로 청크를 yield하고 최종 ChatResponse를 return
 */
export async function* chatWithAIStream(
  userMessage: string,
  currentFiles: FileSystem,
  chatHistory?: ChatMessage[],
  model: AIModel = "gemini",
  attachments?: FileAttachment[]
): AsyncGenerator<string, ChatResponse, unknown> {
  switch (model) {
    case "claude":
      return yield* chatWithClaudeStream(userMessage, currentFiles, chatHistory, attachments);
    case "chatgpt":
      return yield* chatWithOpenAIStream(userMessage, currentFiles, chatHistory, attachments);
    case "gemini":
      return yield* chatWithGeminiStream(userMessage, currentFiles, chatHistory, attachments);
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
}
