import { AIModel, GenerationResult, FileAttachment } from "./aiTypes";

import { generateWithClaude } from "./aiModels/claude";
import { generateWithOpenAI } from "./aiModels/openai";
import { generateWithGemini } from "./aiModels/gemini";

/**
 * 프롬프트 강화 - 사용자 프롬프트를 더 상세하게 확장
 */
function enhancePrompt(userPrompt: string): string {
  const enhancement = `Create a BEAUTIFUL and INTERACTIVE landing page with rich GSAP animations. Always improve your design to the highest level.

  + ${userPrompt}`;

  return enhancement;
}

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
  const enhancedPrompt = enhancePrompt(prompt);

  const generator = (() => {
    switch (model) {
      case "claude":
        return generateWithClaude(enhancedPrompt, attachments);
      case "chatgpt":
        return generateWithOpenAI(enhancedPrompt, attachments);
      case "gemini":
        return generateWithGemini(enhancedPrompt, attachments);
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
