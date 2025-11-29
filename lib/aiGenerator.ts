import Anthropic from "@anthropic-ai/sdk";

export interface FileSystem {
  [filePath: string]: string;
}

export interface GenerationResult {
  files: FileSystem;
  message: string;
}

// Anthropic 클라이언트 (공통 사용)
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// JSON 응답 정리 함수 (공통 사용)
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code blocks
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n/, "");
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\n```$/, "");
  }

  return cleaned.trim();
}

// System prompt for generating code
const SYSTEM_PROMPT = `You are an expert web developer specializing in beautiful, modern web design. Create a stunning, responsive website based on the user's description.

CRITICAL RULES:
1. Return ONLY a valid JSON object - no explanations, no markdown, no code blocks
2. Top-level JSON structure MUST be:
{
  "message": "Short helpful summary of the generated website",
  "files": {
    "index.html": "complete HTML code here"
  }
}
3. Generate a SINGLE, COMPLETE HTML file that includes everything

TECHNICAL REQUIREMENTS:
- Pure HTML/CSS/JavaScript (NO frameworks, NO build tools)
- Use Tailwind CSS via CDN for styling
- Use Google Fonts via CDN for typography
- For animations, you can use:
  * CSS transitions and animations
  * GSAP (via CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>)
  * anime.js (via CDN if needed)
- Use external image URLs (Unsplash, Pexels) - NO local images
- Modern, beautiful design with gradients, shadows, and smooth animations
- Mobile responsive (use Tailwind breakpoints: sm:, md:, lg:, xl:)
- Smooth transitions and hover effects
- Include all JavaScript inline in <script> tags
- Include all CSS in <style> tags (except Tailwind which is CDN)

JAVASCRIPT SAFETY REQUIREMENTS (CRITICAL):
- ALWAYS wrap ALL JavaScript code in document.addEventListener('DOMContentLoaded', function() {...})
- ALWAYS check if elements exist before manipulating them (e.g., if (element) {...})
- When using GSAP animations with numbers:
  * Parse text content before animating: const target = parseInt(element.textContent || '0')
  * ALWAYS validate with isFinite(): if (!isNaN(target) && isFinite(target)) {...}
  * This prevents "non-finite value" Canvas/gradient errors
- For event handlers in HTML (onclick, etc.), define functions OUTSIDE DOMContentLoaded
- Use optional chaining and nullish coalescing when accessing DOM elements

HTML STRUCTURE TEMPLATE:
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Title</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            playfair: ['Playfair Display', 'serif'],
            inter: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>

  <!-- GSAP (if needed for animations) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    /* Add your custom CSS here */
  </style>
</head>
<body>
  <!-- Your beautiful HTML content here -->

  <script>
    // CRITICAL: Wrap ALL JavaScript in DOMContentLoaded to prevent timing issues
    document.addEventListener('DOMContentLoaded', function() {
      // Your JavaScript code here
      // IMPORTANT: Always check if elements exist before animating them
      // IMPORTANT: When using GSAP with numbers, always validate with isFinite()
    });

    // Global functions (if needed for onclick handlers) go outside DOMContentLoaded
  </script>
</body>
</html>

DESIGN GUIDELINES:
- Create visually stunning, modern layouts
- Use smooth animations and transitions
- Implement scroll effects if appropriate
- Make it fully responsive
- Use beautiful typography combinations
- Add subtle hover effects and interactions
- Use modern CSS features (flexbox, grid, custom properties)

Return ONLY the JSON object with the complete HTML file, nothing else.`;

export async function* generateLandingPageStream(
  prompt: string
): AsyncGenerator<string, GenerationResult, unknown> {
  try {
    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 16000,
      temperature: 0.5,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${prompt}`,
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
        yield text; // 청크 전송
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
    console.error("AI Generation error:", error);
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Failed to generate landing page");
  }
}
