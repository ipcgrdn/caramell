import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function generateLandingPage(prompt: string): Promise<string> {
  const systemPrompt = `You are an expert web designer and developer. Create a beautiful, modern, and responsive landing page based on the user's description.

IMPORTANT RULES:
1. Return ONLY valid HTML code - no explanations, no markdown, no code blocks
2. Use Tailwind CSS via CDN (https://cdn.tailwindcss.com)
3. Include Google Fonts if needed
4. Make it mobile-responsive
5. Use beautiful gradients, animations, and modern design patterns
6. Include a complete <!DOCTYPE html> structure
7. The design should be visually stunning and professional
8. Add smooth transitions and hover effects
9. Use semantic HTML

Return ONLY the HTML code, starting with <!DOCTYPE html>.`;

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
          content: `Create a landing page for: ${prompt}`,
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
    if (cleanedResponse.startsWith("```html")) {
      cleanedResponse = cleanedResponse.replace(/^```html\n/, "");
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, "");
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/\n```$/, "");
    }

    return cleanedResponse.trim();
  } catch (error) {
    console.error("AI Generation error:", error);
    throw new Error("Failed to generate landing page");
  }
}
