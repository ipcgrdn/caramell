import Anthropic from "@anthropic-ai/sdk";
import {
  FileSystem,
  GenerationResult,
  ChatMessage,
  ChatResponse,
  FileAttachment,
} from "../aiTypes";
import {
  cleanJsonResponse,
  SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
} from "../aiPrompts";

// Anthropic 클라이언트 초기화
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Claude를 사용한 스트리밍 랜딩 페이지 생성
 */
export async function* generateWithClaude(
  prompt: string,
  attachments?: FileAttachment[]
): AsyncGenerator<string, GenerationResult, unknown> {
  try {
    // 메시지 구성 (파일 첨부가 있는 경우 배열 형식)
    let userContent: string | Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam>;

    if (attachments && attachments.length > 0) {
      const contentBlocks: Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam> = [];

      // 이미지 파일들을 먼저 추가
      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          const base64Data = file.data.split(",")[1] || file.data;
          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Data,
            },
          });
        }
      }

      // 텍스트 메시지 추가
      contentBlocks.push({
        type: "text",
        text: prompt,
      });

      userContent = contentBlocks;
    } else {
      userContent = prompt;
    }

    const stream = anthropic.messages.stream({
      model: "claude-opus-4-5-20251101",
      max_tokens: 16000,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    let fullText = "";

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        const text = chunk.delta.text;
        fullText += text;
        yield text;
      }
    }

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
    console.error("Claude Generation error:", error);
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Failed to generate landing page with Claude");
  }
}

/**
 * Claude를 사용한 스트리밍 채팅 기반 코드 수정
 */
export async function* chatWithClaudeStream(
  userMessage: string,
  currentFiles: FileSystem,
  chatHistory?: ChatMessage[],
  attachments?: FileAttachment[]
): AsyncGenerator<string, ChatResponse, unknown> {
  try {
    const messages: Anthropic.MessageParam[] = [];

    // 채팅 히스토리 추가
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // 현재 메시지 구성 (파일 첨부가 있는 경우 배열 형식)
    if (attachments && attachments.length > 0) {
      const contentBlocks: Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam> = [];

      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          const base64Data = file.data.split(",")[1] || file.data;
          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Data,
            },
          });
        }
      }

      contentBlocks.push({
        type: "text",
        text: `${userMessage}

Remember: Return ONLY valid JSON. No markdown blocks.`,
      });

      messages.push({
        role: "user",
        content: contentBlocks,
      });
    } else {
      messages.push({
        role: "user",
        content: `${userMessage}

Remember: Return ONLY valid JSON. No markdown blocks.`,
      });
    }

    const stream = anthropic.messages.stream({
      model: "claude-opus-4-5-20251101",
      max_tokens: 16000,
      temperature: 0.7,
      system: [
        {
          type: "text",
          text: CHAT_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: `CURRENT PROJECT FILES:\n${JSON.stringify(currentFiles, null, 2)}`,
        },
      ],
      messages,
    });

    let fullText = "";

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        const text = chunk.delta.text;
        fullText += text;
        yield text;
      }
    }

    const cleanedResponse = cleanJsonResponse(fullText);

    try {
      const result = JSON.parse(cleanedResponse);

      if (!result || typeof result !== 'object') {
        throw new Error("Response is not an object");
      }

      const responseText = result.response || result.message;
      if (!responseText || typeof responseText !== 'string') {
        console.error("Invalid response structure:", result);
        throw new Error("Missing or invalid 'response' or 'message' field");
      }

      return {
        response: responseText,
        fileChanges: result.fileChanges
      } as ChatResponse;
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Claude Chat Stream error:", error);
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Failed to get Claude streaming response");
  }
}
