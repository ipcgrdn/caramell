import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini client initialization
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const NEXTJS_PROJECT_PROMPT = `You are a Next.js project converter specializing in creating clean, maintainable, and reusable code.

Convert the provided HTML into a complete, production-ready Next.js project with App Router.

<Core Principles priority="MOST IMPORTANT">
1. **PRESERVE EXACT VISUAL STRUCTURE**: The final output MUST look identical to the original HTML
2. **REUSABLE COMPONENTS**: Break down the UI into small, reusable components
3. **CLEAN CODE**: Write maintainable code following best practices
4. **TYPE SAFETY**: Include proper TypeScript types throughout
</Core Principles>

<Technical Requirements>
- Next.js App Router
- TypeScript with strict typing
- Tailwind CSS for styling
- Component-based architecture
- Proper folder structure
- All dependencies as npm packages (NEVER use CDN links)
</Technical Requirements>

<Project Structure>
\`\`\`json
{
  "package.json": "Must include ALL dependencies (next, react, tailwindcss, gsap, etc.)",
  "tsconfig.json": "...",
  "next.config.js": "...",
  "tailwind.config.ts": "...",
  "postcss.config.js": "...",
  ".gitignore": "...",
  "README.md": "Include setup instructions",
  "app/layout.tsx": "Include font definitions with next/font",
  "app/page.tsx": "...",
  "app/globals.css": "...",
  "components/ui/...": "...",
  "components/sections/...": "...",
  "lib/utils.ts": "...",
}
\`\`\`
</Project Structure>

<Critical Rules>
DO: Create small, focused, reusable components
DO: Preserve the exact visual layout and animations
DO: Use 'use client' directive for components with animations/interactivity
DO: Extract GSAP animations into useEffect hooks
DO: Write clean, readable, well-typed code
NEVER: Add features not present in original HTML
NEVER: Change the visual appearance
NEVER: Use \`any\` types
NEVER: Create monolithic components
</Critical Rules>

Return ONLY a valid JSON object. No additional text.`;

interface ProjectFiles {
  [path: string]: string;
}

export async function generateNextJsProject(
  htmlContent: string
): Promise<ProjectFiles> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16000,
        responseMimeType: "application/json",
      },
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: NEXTJS_PROJECT_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "yes" }],
        },
      ],
    });

    const prompt = `Convert the following HTML into a complete Next.js project:

\`\`\`html
${htmlContent}
\`\`\`

Return the complete project structure as a JSON object.`;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const cleanedResponse = text.trim();
    const projectFiles: ProjectFiles = JSON.parse(cleanedResponse);

    // Validate that essential files exist
    if (!projectFiles["package.json"]) {
      throw new Error("Generated project missing package.json");
    }

    if (!projectFiles["app/page.tsx"]) {
      throw new Error("Generated project missing app/page.tsx");
    }

    return projectFiles;
  } catch (error) {
    console.error("Error generating Next.js project:", error);
    throw new Error("Failed to generate Next.js project with AI");
  }
}
