import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Gemini를 사용한 스트리밍 랜딩 페이지 생성
 */
export async function* generateWithGemini(
  prompt: string
): AsyncGenerator<string, GenerationResult, unknown> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 16000,
      },
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "yes",
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessageStream(prompt);

    let fullText = "";

    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      yield text;
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
    console.error("Gemini Generation error:", error);
    throw new Error("Failed to generate landing page with Gemini");
  }
}

/**
 * Gemini를 사용한 채팅 기반 코드 수정
 */
export async function chatWithGemini(
  userMessage: string,
  currentFiles: FileSystem,
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  const systemPrompt = `${CHAT_SYSTEM_PROMPT}

CURRENT PROJECT FILES:
${JSON.stringify(currentFiles, null, 2)}`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 16000,
      },
    });

    // 채팅 히스토리 구성
    const history: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Yes",
          },
        ],
      },
    ];

    // 이전 채팅 히스토리 추가
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        history.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(`${userMessage}

Remember: Return ONLY valid JSON. No markdown blocks.`);

    const textContent = result.response.text();
    if (!textContent) {
      throw new Error("No text content in response");
    }

    // JSON 파싱
    const cleanedResponse = cleanJsonResponse(textContent);

    try {
      const parsedResult = JSON.parse(cleanedResponse);
      return parsedResult as ChatResponse;
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Gemini Chat error:", error);
    throw new Error("Failed to get Gemini response");
  }
}
