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
      messagesHtml = '<div class="empty">🎄 Be the first to share a holiday message!</div>';
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FestiveWall – Holiday Edition</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Single+Day&display=swap" rel="stylesheet">
  <style>
    :root{
      --main-bg: #f6fcfa;
      --accent: #147664;
      --accent-light: #def6ee;
      --text: #273641;
      --soft: #ececec;
      --msg-bg: #fff;
      --msg-border: #b4dcce;
      --highlight: #f43f5e;
      --radius: 10px;
      --shadow: 0 2px 16px 0 rgba(20,118,100,.04);
    }
    *{ box-sizing:border-box; margin:0; padding:0; }
    body{
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      background: var(--main-bg);
      color: var(--text);
      min-height:100vh;
      padding:2rem 1rem;
    }
    .container{ max-width:560px; margin:0 auto; }
    header { text-align: center; margin-bottom:2.2rem; }
    .holiday-emoji {
      font-size:2.4rem;
      margin-bottom: .5rem;
      display: block;
      font-family:'Single Day', cursive, emoji;
    }
    h1 {
      font-family:'Single Day', cursive, sans-serif;
      font-size:2.2rem;
      color: var(--accent);
      font-weight: 600;
      margin: 0 0 .3rem 0;
      letter-spacing:-1px;
    }
    p.subtitle {
      font-size:1.05rem;
      color: var(--accent);
      margin-bottom: 0.3rem;
      font-weight:500;
    }
    form{
      display:flex;
      gap:.7rem;
      background: var(--accent-light);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: .7rem .85rem;
      margin-bottom: 1.45rem;
      border: 1px solid var(--msg-border);
    }
    input[type="text"]{
      flex:1;
      padding: .8rem 1rem;
      border-radius: var(--radius);
      border: 1px solid var(--msg-border);
      background: #fff;
      font-size: 1rem;
      transition: border-color .15s;
    }
    input[type="text"]:focus {
      border-color: var(--accent);
      outline: none;
    }
    button {
      min-width: 80px;
      padding: .8rem 1.2rem;
      border: none;
      border-radius: var(--radius);
      color: #fff;
      background: var(--highlight);
      font-weight:600;
      font-size:1rem;
      letter-spacing:.03em;
      cursor:pointer;
      box-shadow:0 1px 4px rgba(244,63,94,.09);
      transition: background .13s;
    }
    button:hover { background: #e11d48; }
    main{ display:flex; flex-direction:column; gap:.75rem; }
    .message{
      background: var(--msg-bg);
      border: 1.5px solid var(--msg-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.12rem 1.05rem .82rem 1.05rem;
      font-size:1.045rem;
      line-height:1.6;
      word-break:break-word;
      transition: box-shadow .14s;
    }
    .message:hover { box-shadow: 0 4px 15px 0 #b4dcce4d; border-color: var(--accent); }
    time{
      display:block;
      color: var(--accent);
      margin-top:.6rem;
      font-size:.86rem;
      font-weight:500;
      opacity:.93;
      letter-spacing:.03em;
    }
    .empty{
      text-align:center;
      color:var(--accent);
      font-weight:600;
      padding:2.2rem 1rem;
      font-size:1.12rem;
      opacity:.7;
    }
    @media(max-width:640px){
      .container{max-width:98vw}
      form{flex-direction:column; gap:.6rem}
      button{width:100%}
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="holiday-emoji" role="img" aria-label="tree">🎄</span>
      <h1>FestiveWall</h1>
      <p class="subtitle">Minimal holiday cheer – share a wish!</p>
    </header>
    <form method="POST" autocomplete="off">
      <input name="message" type="text" placeholder="Write a cheerful holiday message…" required maxlength="500" autocomplete="off">
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
