import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Gemini를 사용한 스트리밍 랜딩 페이지 생성
 */
export async function* generateWithGemini(
  prompt: string,
  attachments?: FileAttachment[]
): AsyncGenerator<string, GenerationResult, unknown> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 16000,
        responseMimeType: "application/json",
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

    // 메시지 구성 (파일 첨부가 있는 경우 배열 형식)
    let messageParts: string | Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;

    if (attachments && attachments.length > 0) {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      // 텍스트 메시지를 먼저 추가
      parts.push({
        text: prompt,
      });

      // 이미지 파일들을 추가
      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          const base64Data = file.data.split(",")[1] || file.data;
          parts.push({
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          });
        }
      }

      messageParts = parts;
    } else {
      messageParts = prompt;
    }

    const result = await chat.sendMessageStream(messageParts);

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
  chatHistory?: ChatMessage[],
  attachments?: FileAttachment[]
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
        responseMimeType: "application/json",
      },
    });

    // 채팅 히스토리 구성
    const history: Array<{
      role: "user" | "model";
      parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
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

    // 현재 메시지 구성 (파일 첨부가 있는 경우 배열 형식)
    if (attachments && attachments.length > 0) {
      const messageParts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [];

      // 텍스트 메시지를 먼저 추가
      messageParts.push({
        text: `${userMessage}

Remember: Return ONLY valid JSON. No markdown blocks.`,
      });

      // 이미지 파일들을 추가
      for (const file of attachments) {
        if (file.type.startsWith("image/")) {
          // data:image/jpeg;base64,... 형식에서 base64 부분만 추출
          const base64Data = file.data.split(",")[1] || file.data;
          messageParts.push({
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          });
        }
      }

      const result = await chat.sendMessage(messageParts);
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
    } else {
      // 파일 첨부가 없는 경우 기존 방식
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
    }
  } catch (error) {
    console.error("Gemini Chat error:", error);
    throw new Error("Failed to get Gemini response");
  }
}
