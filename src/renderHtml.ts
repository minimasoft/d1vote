export function renderHtml(content: Record<string, any>) {
  const payload = JSON.stringify(content ?? {});
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Votekeys</title>
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Helvetica Neue", Arial; padding: 2rem; }
    pre code { color: #b00020; font-weight: 700; }
    button { padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; }
    .container { max-width: 720px; margin: 0 auto; }
    .meta { margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Gestión de Votekeys</h1>
    <div id="result"></div>
    <div class="meta" id="meta"></div>
  </div>

  <script>
    // Server-provided payload for initial render
    const initialPayload = ${payload};

    function render(obj) {
      const result = document.getElementById('result');
      const meta = document.getElementById('meta');
      result.innerHTML = '';
      meta.innerHTML = '';

      // Error block (pre>code with red text)
      if (obj && obj.error) {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = 'Error: ' + String(obj.error);
        pre.appendChild(code);
        result.appendChild(pre);
      }

      // votekey header
      if (obj && obj.votekey) {
        const h2 = document.createElement('h2');
        h2.textContent = 'KEY: ' + String(obj.votekey);
        result.appendChild(h2);
      }

      // remain
      if (obj && typeof obj.remain !== 'undefined' && obj.remain !== null) {
        const h3 = document.createElement('h3');
        h3.textContent = 'Quedan ' + String(obj.remain) + ' votekeys.';
        result.appendChild(h3);
      }

      // candidate button
      if (obj && obj.candidate) {
        const btn = document.createElement('button');
        btn.textContent = 'Pedir key';
        btn.onclick = async () => {
          btn.disabled = true;
          btn.textContent = 'Enviando...';
          try {
            const res = await fetch(window.location.pathname, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uuid: obj.candidate })
            });
            const json = await res.json();
            // If candidate was already used the server returns error + new candidate; re-render with that response
            render(json);
          } catch (e) {
            render({ error: 'error de red' });
          } finally {
            // noop: render may replace button; if not, re-enable
            if (document.body.contains(btn)) {
              btn.disabled = false;
              btn.textContent = 'Pedir key';
            }
          }
        };
        meta.appendChild(btn);
      }
    }

    // initial render
    render(initialPayload);
  </script>
</body>
</html>`;
}