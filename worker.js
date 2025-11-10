export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST") {
      const formData = await request.formData();
      const raw = formData.get("message");
      const message = raw ? String(raw).trim().slice(0, 500) : "";
      if (message.length > 0) {
        await env.DB.prepare("INSERT INTO messages (content) VALUES (?)")
          .bind(message)
          .run();
      }
      return Response.redirect(url.origin, 303);
    }

    const q = await env.DB.prepare(
      "SELECT content, created_at FROM messages ORDER BY id DESC LIMIT 50"
    ).all();
    const rows = q && q.results ? q.results : [];

    function esc(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    let messagesHtml = "";
    for (let i = 0; i < rows.length; i++) {
      messagesHtml += `<div class="message">${esc(rows[i].content)}<time>${esc(rows[i].created_at)}</time></div>`;
    }

    if (!messagesHtml) {
      messagesHtml = '<div class="empty">Share your message</div>';
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FestiveWall</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root{
      --primary:#2d2d2d;
      --background:#ffffff;
      --surface:#f5f5f5;
      --border:#e6e6e6;
      --text:#2d2d2d;
      --muted:#666666;
      --radius:8px;
      --transition:180ms ease;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;
      background:var(--background);
      color:var(--text);
      line-height:1.5;
      padding:2rem 1rem;
      min-height:100vh;
    }
    .container{max-width:640px;margin:0 auto}
    header{margin-bottom:2rem;text-align:center}
    h1{font-size:2rem;font-weight:500;margin-bottom:.4rem}
    p.subtitle{color:var(--muted);font-size:0.95rem;margin:0}
    form{display:flex;gap:1rem;margin-bottom:1.75rem}
    input[type="text"]{
      flex:1;padding:.75rem 1rem;border:1px solid var(--border);border-radius:var(--radius);
      background:var(--background);font-size:1rem;transition:border-color var(--transition);font-family:inherit
    }
    input[type="text"]:focus{outline:none;border-color:var(--primary)}
    button{
      padding:.75rem 1.25rem;border-radius:var(--radius);border:none;background:var(--primary);
      color:var(--background);cursor:pointer;font-weight:500;transition:opacity var(--transition)
    }
    button:hover{opacity:.92}
    main{display:flex;flex-direction:column;gap:.9rem}
    .message{
      background:var(--surface);padding:1.1rem;border-radius:var(--radius);border:1px solid var(--border);
      animation:fade .28s ease both;
    }
    time{display:block;margin-top:.6rem;color:var(--muted);font-size:.875rem}
    .empty{text-align:center;padding:2.5rem 1rem;color:var(--muted)}
    @keyframes fade{from{opacity:0;transform:translateY(.25rem)}to{opacity:1;transform:none}}
    @media(max-width:640px){
      form{flex-direction:column}
      button{width:100%}
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>FestiveWall</h1>
      <p class="subtitle">Share your message with others</p>
    </header>
    <form method="POST" autocomplete="off">
      <input name="message" type="text" placeholder="Write something..." required maxlength="500" autocomplete="off">
      <button type="submit">Post</button>
    </form>
    <main>
      ${messagesHtml}
    </main>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
