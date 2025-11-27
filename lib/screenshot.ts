import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";
import { join } from "path";

/**
 * Extract HTML content from project files for screenshot generation
 */
export function extractHtmlFromFiles(
  files: Record<string, string>
): string | null {
  // If there's an index.html file, use it directly
  if (files["index.html"]) {
    return files["index.html"];
  }

  // For Next.js projects, we need to convert JSX to executable HTML
  const pageContent = files["app/page.tsx"] || files["pages/index.tsx"] || "";

  if (!pageContent) {
    return null;
  }

  // Process all component files
  const componentFiles = Object.entries(files)
    .filter(([path]) => path.endsWith(".tsx"))
    .sort(([pathA], [pathB]) => {
      // Sort so that app/page.tsx comes last
      if (pathA.includes("page.tsx")) return 1;
      if (pathB.includes("page.tsx")) return -1;
      return 0;
    });

  const processedComponents = componentFiles
    .map(([path, content]) => processComponentFile(content, path))
    .join("\n\n");

  // Create a standalone HTML that can render the React components
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    ${processedComponents}

    // Find and render the main page component
    const AppComponent = ${extractMainComponent(pageContent)};

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(AppComponent));
  </script>
</body>
</html>
  `.trim();
}

/**
 * Process a single component file for browser execution
 */
function processComponentFile(content: string, filePath: string): string {
  let processed = content;

  // Remove 'use client' directive
  processed = processed.replace(/['"]use client['"];?\s*/g, "");

  // Remove all import statements
  processed = processed.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");

  // Convert "export default function Component" to "function Component"
  processed = processed.replace(
    /export\s+default\s+function\s+(\w+)/g,
    "function $1"
  );

  // Convert "export function Component" to "function Component"
  processed = processed.replace(/export\s+function\s+(\w+)/g, "function $1");

  // Handle "export default Component" at the end
  processed = processed.replace(/export\s+default\s+(\w+);?\s*$/g, "// $1");

  return `// Component from ${filePath}\n${processed}`;
}

/**
 * Extract the main component to render
 */
function extractMainComponent(content: string): string {
  // Try to find "export default function ComponentName"
  let match = content.match(/export\s+default\s+function\s+(\w+)/);
  if (match) {
    return match[1];
  }

  // Try to find "export default ComponentName"
  match = content.match(/export\s+default\s+(\w+)/);
  if (match) {
    return match[1];
  }

  // Try to find any function declaration
  match = content.match(/function\s+(\w+)/);
  if (match) {
    return match[1];
  }

  // Fallback: create error component
  return "(() => React.createElement('div', { style: { padding: '20px', color: 'red' } }, 'Error: Could not find main component'))";
}

/**
 * Regenerate screenshot for a project based on its current files
 */
export async function regenerateProjectScreenshot(
  projectId: string,
  files: Record<string, string>
): Promise<string | null> {
  const htmlContent = extractHtmlFromFiles(files);

  if (!htmlContent) {
    console.warn("No HTML content found for screenshot generation");
    return null;
  }

  try {
    return await generateScreenshot(htmlContent, projectId);
  } catch (error) {
    console.error("Screenshot regeneration failed:", error);
    return null;
  }
}

export async function generateScreenshot(
  html: string,
  projectId: string
): Promise<string> {
  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set viewport to standard desktop size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Set content
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for React to render and animations/fonts to load
    // This is important for Babel to transpile and React to mount
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false, // Only capture viewport
    });

    // Save to public/screenshots
    const filename = `${projectId}.png`;
    const filepath = join(process.cwd(), "public", "screenshots", filename);
    await writeFile(filepath, screenshot);

    // Return the public URL path
    return `/screenshots/${filename}`;
  } catch (error) {
    console.error("Screenshot generation error:", error);
    throw new Error("Failed to generate screenshot");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function generateScreenshotFromUrl(
  url: string,
  projectId: string
): Promise<string> {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    const filename = `${projectId}.png`;
    const filepath = join(process.cwd(), "public", "screenshots", filename);
    await writeFile(filepath, screenshot);

    return `/screenshots/${filename}`;
  } catch (error) {
    console.error("Screenshot generation error:", error);
    throw new Error("Failed to generate screenshot from URL");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
