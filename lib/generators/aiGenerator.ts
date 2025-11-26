import { OpenRouter } from "@openrouter/sdk";

export interface FileSystem {
  [filePath: string]: string;
}

export interface GeneratedProject {
  files: FileSystem;
  entryPoint: string; // e.g., "app/page.tsx"
}

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// System prompt for generating code
const SYSTEM_PROMPT = `You are an expert Next.js and React developer. Create a beautiful, modern, and responsive landing page based on the user's description.

CRITICAL RULES:
1. Return ONLY a valid JSON object - no explanations, no markdown, no code blocks
2. Use ONLY client components ('use client' directive)
3. Structure must be a flat object with file paths as keys:
{
  "app/page.tsx": "code here",
  "components/Hero.tsx": "code here",
  "components/Features.tsx": "code here"
}

TECHNICAL REQUIREMENTS:
- Use Next.js 15 App Router
- All components must have 'use client' at the top
- Use TypeScript (.tsx files)
- Use Tailwind CSS for styling (classes only, no config needed)
- NO server components, NO async functions, NO API routes
- NO import statements except React hooks (useState, useEffect, etc)
- NO next/image - use regular <img> tags
- Modern, beautiful design with gradients and animations
- Mobile responsive
- Smooth transitions and hover effects

COMPONENT STRUCTURE:
- app/page.tsx: Main page that composes all components
- components/*.tsx: Individual feature components (Hero, Features, CTA, etc)
- Each component should be simple and focused

Return ONLY the JSON object, nothing else.`;

export async function generateLandingPage(prompt: string): Promise<FileSystem> {

  try {
    const stream = await openrouter.chat.send({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Create a Next.js landing page for: ${prompt}`,
        },
      ],
      stream: true,
      streamOptions: {
        includeUsage: true,
      },
    });

    let response = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        response += content;
      }
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();

    // Remove markdown code blocks
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, "");
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, "");
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/\n```$/, "");
    }

    // Parse JSON to FileSystem
    try {
      const files: FileSystem = JSON.parse(cleanedResponse.trim());

      // Validate the structure
      if (typeof files !== "object" || files === null) {
        throw new Error("Invalid file structure: not an object");
      }

      // Ensure we have at least app/page.tsx
      if (!files["app/page.tsx"]) {
        throw new Error("Invalid file structure: missing app/page.tsx");
      }

      return files;
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse generated code structure");
    }
  } catch (error) {
    console.error("AI Generation error:", error);
    throw new Error("Failed to generate landing page");
  }
}

// Chat function to modify existing code
export async function chatWithAI(
  userMessage: string,
  currentFiles: FileSystem
): Promise<{ response: string; files?: FileSystem }> {
  const systemPrompt = `You are an expert Next.js and React developer. The user has an existing Next.js project and wants to modify it.

CURRENT PROJECT FILES:
${JSON.stringify(currentFiles, null, 2)}

USER REQUEST:
${userMessage}

YOUR TASK:
1. Understand the user's request
2. If the request requires code changes, return a JSON response with:
   {
     "response": "Brief explanation of what you'll do",
     "files": { ...updated files... }
   }
3. If the request is just a question or doesn't require code changes, return:
   {
     "response": "Your helpful answer"
   }

RULES FOR CODE CHANGES:
- Return ONLY valid JSON
- Maintain the same structure as the current files
- Use 'use client' directive
- Use TypeScript and Tailwind CSS
- NO server components, NO async functions
- Keep existing components that aren't being modified

Return ONLY the JSON response.`;

  try {
    const stream = await openrouter.chat.send({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      stream: true,
      streamOptions: {
        includeUsage: true,
      },
    });

    let response = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        response += content;
      }
    }

    // Clean up the response
    let cleanedResponse = response.trim();

    // Remove markdown code blocks
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, "");
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, "");
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/\n```$/, "");
    }

    // Parse JSON response
    try {
      const result = JSON.parse(cleanedResponse.trim());
      return result;
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Response was:", cleanedResponse);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("AI Chat error:", error);
    throw new Error("Failed to get AI response");
  }
}
