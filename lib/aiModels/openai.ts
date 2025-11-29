import OpenAI from "openai";
import {
  FileSystem,
  GenerationResult,
  ChatMessage,
  ChatResponse,
} from "../aiTypes";
import {
  cleanJsonResponse,
  SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
} from "../aiPrompts";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * OpenAI를 사용한 스트리밍 랜딩 페이지 생성
 */
export async function* generateWithOpenAI(
  prompt: string
): AsyncGenerator<string, GenerationResult, unknown> {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 16000,
      stream: true,
    });

    let fullText = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        yield delta;
      }
    }

    // JSON 파싱 및 검증
    const cleanedResponse = cleanJsonResponse(fullText);

    try {
      const parsed: unknown = JSON.parse(cleanedResponse.trim());

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid response: not an object");
      }

      const { message, files } = parsed as {
        message?: unknown;
        files?: unknown;
      };

      if (typeof message !== "string" || !message.trim()) {
        throw new Error("Invalid response: missing or empty message");
      }

      if (!files || typeof files !== "object" || Array.isArray(files)) {
        throw new Error("Invalid file structure: not an object");
      }

      const fileEntries = Object.entries(files as Record<string, unknown>);
      for (const [path, content] of fileEntries) {
        if (typeof content !== "string") {
          throw new Error(`Invalid file content for ${path}`);
        }
      }

      if (!(files as Record<string, string>)["index.html"]) {
        throw new Error("Invalid file structure: missing index.html");
      }

      return {
        files: files as FileSystem,
        message: message.trim(),
      };
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse generated code structure");
    }
  } catch (error) {
    console.error("OpenAI Generation error:", error);
    throw new Error("Failed to generate landing page with OpenAI");
  }
}

/**
 * OpenAI를 사용한 채팅 기반 코드 수정
 */
export async function chatWithOpenAI(
  userMessage: string,
  currentFiles: FileSystem,
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  const systemPrompt = `${CHAT_SYSTEM_PROMPT}

CURRENT PROJECT FILES:
${JSON.stringify(currentFiles, null, 2)}`;

  try {
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // 채팅 히스토리 추가
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // 현재 메시지 추가
    messages.push({
      role: "user",
      content: `${userMessage}

Remember: Return ONLY valid JSON. No markdown blocks.`,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages,
      max_completion_tokens: 16000,
    });

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error("No text content in response");
    }

    const cleanedResponse = cleanJsonResponse(textContent);

    try {
      const result = JSON.parse(cleanedResponse);
      return result as ChatResponse;
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("OpenAI Chat error:", error);
    throw new Error("Failed to get OpenAI response");
  }
}
