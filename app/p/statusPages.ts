// Shared HTML snippets for project status responses.
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #000000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .container {
    text-align: center;
    padding: 2rem;
  }

  .title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
  }

  .description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
  }

  .btn {
    display: inline-block;
    padding: 0.875rem 2rem;
    background: #D4A574;
    color: #000000;
    text-decoration: none;
    border-radius: 0.75rem;
    font-weight: 500;
    font-size: 0.875rem;
    transition: background 0.2s;
  }

  .btn:hover {
    background: #C68E52;
  }

  .card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #D4A574;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 28rem;
    margin: 0 auto;
  }
`;

export function notFoundHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Not Found - Caramell</title>
  <style>
    ${baseStyles}

    .error-code {
      font-family: 'Playfair Display', serif;
      font-size: 6rem;
      font-weight: 700;
      color: #D4A574;
      line-height: 1;
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-code">404</div>
    <h1 class="title">Page Not Found</h1>
    <p class="description">The project you're looking for doesn't exist or has been deleted.</p>
    <a href="/" class="btn">Back to Home</a>
  </div>
</body>
</html>`;
}

export function generatingHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Generating... - Caramell</title>
  <style>
    ${baseStyles}

    .loader {
      width: 48px;
      height: 48px;
      background: #FFFFFF;
      margin: 0 auto 2rem;
      animation: morph 2s ease-in-out infinite;
    }

    @keyframes morph {
      0%, 100% {
        border-radius: 6%;
        transform: rotate(0deg);
      }
      50% {
        border-radius: 50%;
        transform: rotate(180deg);
      }
    }

    .command-box {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.875rem;
      text-align: left;
      margin-bottom: 0.75rem;
    }

    .command-box:last-child {
      margin-bottom: 0;
    }

    .command-prefix {
      color: rgba(255, 255, 255, 0.5);
    }

    .hint {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="loader"></div>
    <h1 class="title">Generating Your Page</h1>
    <p class="description">Please wait while we build your landing page.</p>
    <a href="/" class="btn">Back to Home</a>
  </div>
</body>
</html>`;
}

export function noContentHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>No Content - Caramell</title>
  <style>
    ${baseStyles}

    .icon {
      margin: 0 auto 1.5rem;
    }

    .icon svg {
      width: 64px;
      height: 64px;
      stroke: #D4A574;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <h1 class="title">No Content Available</h1>
    <p class="description">This project doesn't have any content to display yet.</p>
    <a href="/" class="btn">Back to Home</a>
  </div>
</body>
</html>`;
}
