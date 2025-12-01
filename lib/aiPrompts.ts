import { FOUNDATION } from "./aiPrompts/01-foundation";
import { DESIGN_SYSTEMS } from "./aiPrompts/02-design-systems";
import { COMPONENTS } from "./aiPrompts/03-components";
import { ANIMATIONS } from "./aiPrompts/04-animations";
import { REFINEMENT } from "./aiPrompts/05-refinement";

export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

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

export const SYSTEM_PROMPT = `
${FOUNDATION}

${DESIGN_SYSTEMS}

${COMPONENTS}

${ANIMATIONS}

`.trim();

export const CHAT_SYSTEM_PROMPT = `
${REFINEMENT}

${FOUNDATION}

${DESIGN_SYSTEMS}

${COMPONENTS}

${ANIMATIONS}
`.trim();
