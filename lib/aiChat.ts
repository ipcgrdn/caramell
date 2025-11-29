import { AIModel, FileSystem, ChatMessage, ChatResponse } from "./aiTypes";

import { chatWithClaude } from "./aiModels/claude";
import { chatWithOpenAI } from "./aiModels/openai";
import { chatWithGemini } from "./aiModels/gemini";

/**
 * 채팅 기반 코드 수정 함수
 *
 * @param userMessage - 사용자의 수정 요청 메시지
 * @param currentFiles - 현재 프로젝트 파일들 (FileSystem 객체)
 * @param chatHistory - 이전 대화 히스토리 (컨텍스트 유지용)
 * @param model - 사용할 AI 모델 (기본값: "claude")
 * @returns 응답 메시지와 선택적 파일 변경사항
 */
export async function chatWithAI(
  userMessage: string,
  currentFiles: FileSystem,
  chatHistory?: ChatMessage[],
  model: AIModel = "claude"
): Promise<ChatResponse> {
  switch (model) {
    case "claude":
      return await chatWithClaude(userMessage, currentFiles, chatHistory);
    case "chatgpt":
      return await chatWithOpenAI(userMessage, currentFiles, chatHistory);
    case "gemini":
      return await chatWithGemini(userMessage, currentFiles, chatHistory);
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
}
