import { AIModel, GenerationResult, FileAttachment } from "./aiTypes";

import { generateWithClaude } from "./aiModels/claude";
import { generateWithOpenAI } from "./aiModels/openai";
import { generateWithGemini } from "./aiModels/gemini";

/**
 * 선택한 AI 모델로 랜딩 페이지를 생성합니다 (스트리밍 방식)
 *
 * @param prompt - 사용자 프롬프트
 * @param model - 사용할 AI 모델 (기본값: "gemini")
 * @param attachments - 첨부 파일들 (선택적)
 * @returns 스트리밍 제너레이터 및 최종 결과
 */
export async function* generateLandingPageStream(
  prompt: string,
  model: AIModel = "gemini",
  attachments?: FileAttachment[]
): AsyncGenerator<string, GenerationResult, unknown> {
  const generator = (() => {
    switch (model) {
      case "claude":
        return generateWithClaude(prompt, attachments);
      case "chatgpt":
        return generateWithOpenAI(prompt, attachments);
      case "gemini":
        return generateWithGemini(prompt, attachments);
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  })();

  let finalResult: GenerationResult = { files: {}, message: "" };

  while (true) {
    const { value, done } = await generator.next();

    if (done) {
      finalResult = value ?? finalResult;
      return finalResult;
    }

    yield value;
  }
}
