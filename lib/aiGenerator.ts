import { AIModel, GenerationResult } from "./aiTypes";

import { generateWithClaude } from "./aiModels/claude";
import { generateWithOpenAI } from "./aiModels/openai";
import { generateWithGemini } from "./aiModels/gemini";

/**
 * 선택한 AI 모델로 랜딩 페이지를 생성합니다 (스트리밍 방식)
 *
 * @param prompt - 사용자 프롬프트
 * @param model - 사용할 AI 모델 (기본값: "claude")
 * @returns 스트리밍 제너레이터 및 최종 결과
 */
export async function* generateLandingPageStream(
  prompt: string,
  model: AIModel = "claude"
): AsyncGenerator<string, GenerationResult, unknown> {
  switch (model) {
    case "claude":
      yield* generateWithClaude(prompt);
      break;
    case "chatgpt":
      yield* generateWithOpenAI(prompt);
      break;
    case "gemini":
      yield* generateWithGemini(prompt);
      break;
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }

  return { files: {}, message: "" };
}
