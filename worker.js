export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // POST: save message
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

    // GET: read messages
    const q = await env.DB.prepare(
      "SELECT content, created_at FROM messages ORDER BY id DESC LIMIT 50"
    ).all();
    const rows = (q && q.results) ? q.results : [];

    // build HTML (escape messages)
    function esc(s) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return String(s).replace(/[&<>"']/g, (c) => entities[c]);
    }

    const messagesHtml = rows
      .map(
        (r) =>
          `<div class="msg">${esc(r.content)}<div class="time">${esc(
            r.created_at
          )}</div></div>`
      )
      .join("");

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FestiveWall 🎄</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:'Segoe UI',system-ui,Arial;
  min-height:100vh;
  background:linear-gradient(135deg,#1a472a 0%,#0d2818 50%,#2d1b1b 100%);
  color:#fff;
  padding:2rem 1rem;
  position:relative;
  overflow-x:hidden
}
body::before{
  content:'';
  position:fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background:
    radial-gradient(circle at 20% 30%,rgba(255,215,0,.1) 0%,transparent 50%),
    radial-gradient(circle at 80% 70%,rgba(220,20,60,.1) 0%,transparent 50%);
  pointer-events:none;
  z-index:0
}
.container{max-width:800px;margin:0 auto;position:relative;z-index:1}
h1{
  font-size:3.5rem;
  text-align:center;
  margin-bottom:1rem;
  background:linear-gradient(45deg,#ffd700,#ff6b6b,#4ecdc4,#ffd700);
  background-size:300% 300%;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:gradient 3s ease infinite;
  text-shadow:0 0 30px rgba(255,215,0,.3);
  font-weight:800;
  letter-spacing:-1px
}
@keyframes gradient{
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
.subtitle{
  text-align:center;
  font-size:1.1rem;
  color:#ffd700;
  margin-bottom:2.5rem;
  opacity:.9;
  font-weight:500
}
form{
  background:rgba(255,255,255,.1);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.2);
  border-radius:16px;
  padding:1.5rem;
  margin-bottom:2rem;
  box-shadow:0 8px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.1)
}
.form-inner{display:flex;gap:.8rem;flex-wrap:wrap}
input[type=text]{
  flex:1;
  min-width:250px;
  padding:1rem 1.2rem;
  border-radius:12px;
  border:2px solid rgba(255,255,255,.2);
  background:rgba(255,255,255,.95);
  color:#2d1b1b;
  font-size:1rem;
  transition:all .3s ease;
  font-weight:500
}
input[type=text]:focus{
  outline:none;
  border-color:#ffd700;
  box-shadow:0 0 0 3px rgba(255,215,0,.2),0 4px 12px rgba(0,0,0,.1);
  transform:translateY(-1px)
}
input[type=text]::placeholder{color:#666}
button{
  padding:1rem 2rem;
  border-radius:12px;
  border:none;
  background:linear-gradient(135deg,#dc143c 0%,#8b0000 100%);
  color:#fff;
  font-size:1rem;
  font-weight:700;
  cursor:pointer;
  transition:all .3s ease;
  box-shadow:0 4px 15px rgba(220,20,60,.4);
  text-transform:uppercase;
  letter-spacing:.5px
}
button:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 20px rgba(220,20,60,.6)
}
button:active{transform:translateY(0)}
main{display:grid;gap:1rem}
.msg{
  background:rgba(255,255,255,.12);
  backdrop-filter:blur(10px);
  padding:1.5rem;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.2);
  box-shadow:0 4px 20px rgba(0,0,0,.2);
  transition:all .3s ease;
  position:relative;
  overflow:hidden;
  animation:slideIn .5s ease
}
@keyframes slideIn{
  from{opacity:0;transform:translateY(20px)}
  to{opacity:1;transform:translateY(0)}
}
.msg::before{
  content:'';
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:3px;
  background:linear-gradient(90deg,#ffd700,#dc143c,#4ecdc4);
  background-size:200% 200%;
  animation:gradientMove 3s ease infinite
}
@keyframes gradientMove{
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
.msg:hover{
  transform:translateY(-4px);
  box-shadow:0 8px 30px rgba(0,0,0,.3);
  border-color:rgba(255,215,0,.4)
}
.time{
  font-size:.85rem;
  color:#ffd700;
  margin-top:.8rem;
  opacity:.8;
  font-weight:600;
  display:flex;
  align-items:center;
  gap:.4rem
}
.time::before{
  content:'❄️';
  font-size:.9rem
}
.snow{
  position:fixed;
  top:-10px;
  z-index:999;
  pointer-events:none;
  animation:fall linear infinite
}
@keyframes fall{
  to{transform:translateY(100vh)}
}
.empty{
  text-align:center;
  padding:4rem 2rem;
  color:rgba(255,255,255,.6);
  font-size:1.1rem
}
@media(max-width:640px){
  h1{font-size:2.5rem}
  .subtitle{font-size:1rem}
  .form-inner{flex-direction:column}
  input[type=text]{min-width:100%}
  button{width:100%}
}
</style>
</head><body>
<div class="container">
<h1>🎄 FestiveWall 🎅</h1>
<p class="subtitle">✨ Share your holiday cheer with the world! ✨</p>
<form method="POST">
  <div class="form-inner">
    <input name="message" type="text" placeholder="Spread some holiday joy..." required maxlength="500">
    <button type="submit">🎁 Post</button>
  </div>
</form>
<main>${messagesHtml || '<div class="empty">🎄 Be the first to spread holiday cheer! 🎄</div>'}</main>
</div>
<script>
function createSnowflake(){
  const snow=document.createElement('div');
  snow.className='snow';
  snow.textContent='❄';
  snow.style.left=Math.random()*100+'vw';
  snow.style.fontSize=Math.random()*10+10+'px';
  snow.style.opacity=Math.random()*.6+.4;
  snow.style.animationDuration=Math.random()*3+5+'s';
  document.body.appendChild(snow);
  setTimeout(()=>snow.remove(),8000)
}
setInterval(createSnowflake,300);
</script>
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
