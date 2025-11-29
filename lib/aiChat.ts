import Anthropic from "@anthropic-ai/sdk";
import { FileSystem, anthropic, cleanJsonResponse } from "./aiGenerator";

// 채팅 전용 시스템 프롬프트
const CHAT_SYSTEM_PROMPT = `You are an expert web developer helping users refine their website.

You will receive:
1. Current project file (single HTML file)
2. User's modification request
3. Chat history for context

# YOUR TASK

Analyze the request and respond with JSON:

## If NO code changes needed (just answering a question):
{
  "response": "Your helpful answer"
}

## If code changes ARE needed:
{
  "response": "Brief explanation of what you're changing and why",
  "fileChanges": {
    "index.html": "COMPLETE updated HTML file content"
  }
}

# CODE MODIFICATION RULES

1. **Single HTML file**
   - Always modify the complete "index.html" file
   - Include ALL content, not just changed parts

2. **Complete file content**
   - Return the ENTIRE HTML file with all sections
   - Include <head>, <body>, <style>, and <script> tags

3. **Maintain design consistency**
   - Keep the same color scheme and style unless asked to change
   - Preserve the visual language
   - Match the existing design patterns

4. **Improve incrementally**
   - Make the requested change precisely
   - Optionally suggest subtle improvements
   - Don't over-engineer

# TECHNICAL STANDARDS

- Pure HTML/CSS/JavaScript (NO frameworks, NO build tools)
- Tailwind CSS via CDN for styling
- Use external image URLs (Unsplash, Pexels)
- Google Fonts via CDN
- GSAP available for animations via CDN
- All JavaScript inline in <script> tags
- All custom CSS in <style> tags
- Mobile-first responsive design
- Modern, beautiful aesthetics

# FILE STRUCTURE

Single index.html containing:
- Complete HTML structure
- Inline CSS in <style> tags (within <head>)
- Inline JavaScript in <script> tags (before </body>)
- External resources via CDN (Tailwind, GSAP, Google Fonts)

# DESIGN IMPROVEMENTS TO SUGGEST

When users ask for improvements, consider:
- **Better gradients**: Use sophisticated color combinations (purple → pink → orange)
- **Enhanced hover effects**: scale-105, shadow-2xl, smooth transitions
- **Improved spacing**: More whitespace, better section padding (py-24, py-32)
- **Typography hierarchy**: Clearer font sizes and weights
- **Glass morphism**: backdrop-blur-xl, bg-white/10, border-white/20
- **CSS/GSAP animations**: Smooth entrance animations, scroll effects
- **Better mobile responsiveness**: Optimized layouts for sm/md/lg breakpoints
- **Accessibility**: Better contrast, focus states, ARIA labels
- **Modern CSS**: Flexbox, Grid, custom properties, transitions

# RESPONSE QUALITY

- Be concise but informative
- Explain what you changed and why
- Suggest 1-2 optional improvements if relevant
- Keep the same design language unless explicitly asked to change

Return ONLY valid JSON, no markdown blocks.`;

/**
 * 채팅 기반 코드 수정 함수
 *
 * @param userMessage - 사용자의 수정 요청 메시지
 * @param currentFiles - 현재 프로젝트 파일들 (FileSystem 객체)
 * @param chatHistory - 이전 대화 히스토리 (컨텍스트 유지용)
 * @returns 응답 메시지와 선택적 파일 변경사항
 */
export async function chatWithAI(
  userMessage: string,
  currentFiles: FileSystem,
  chatHistory?: Array<{ role: string; content: string }>
): Promise<{ response: string; fileChanges?: FileSystem }> {
  const systemPrompt = `${CHAT_SYSTEM_PROMPT}

CURRENT PROJECT FILES:
${JSON.stringify(currentFiles, null, 2)}`;

  try {
    // Build messages array with chat history
    const messages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    // Add chat history if provided (컨텍스트 유지)
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: `${userMessage}

Remember: Return ONLY valid JSON. No markdown blocks.`,
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8000,
      temperature: 1,
      system: systemPrompt,
      messages,
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Clean up the response using shared utility
    const cleanedResponse = cleanJsonResponse(textContent.text);

    // Parse JSON response
    try {
      const result = JSON.parse(cleanedResponse);
      return result;
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("AI Chat error:", error);
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Failed to get AI response");
  }
}
