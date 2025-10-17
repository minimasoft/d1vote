export function renderHtml(content: unknown) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>D1</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>
    
      <body>
        <main>
          <p>Votekeys</p>
          <pre><code>${JSON.stringify(content)}</code></pre>
        </main>
      </body>
    </html>
`;
}
