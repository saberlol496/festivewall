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
      const entities = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"};
      return String(s).replace(/[&<>"']/g, function(c) { return entities[c]; });
    }

    const messagesHtml = rows.map(function(r) {
      return '<div class="msg">' + esc(r.content) + '<div class="time">' + esc(r.created_at) + '</div></div>';
    }).join("");

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FestiveWall</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;min-height:100vh;background:#0a1628;color:#fff;padding:2rem 1rem;position:relative;overflow-x:hidden}
body::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at top left,rgba(139,69,19,.15),transparent 50%),radial-gradient(ellipse at top right,rgba(25,135,84,.15),transparent 50%),radial-gradient(ellipse at bottom,rgba(220,20,60,.12),transparent 60%);pointer-events:none}
.container{max-width:900px;margin:0 auto;position:relative;z-index:1}
.header{text-align:center;margin-bottom:3rem;position:relative}
h1{font-size:4.5rem;margin-bottom:.5rem;background:linear-gradient(135deg,#ff6b6b 0%,#ffd93d 25%,#6bcf7f 50%,#4d96ff 75%,#ff6b6b 100%);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rainbow 4s ease infinite;font-weight:800;letter-spacing:-2px;filter:drop-shadow(0 0 20px rgba(255,107,107,.4))}
@keyframes rainbow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.subtitle{font-size:1.3rem;color:#ffd93d;opacity:.95;font-weight:600;text-shadow:0 2px 10px rgba(255,217,61,.3);letter-spacing:.5px}
.ornaments{position:absolute;top:-30px;width:100%;display:flex;justify-content:space-around;font-size:2.5rem;animation:sway 3s ease-in-out infinite}
@keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
form{background:linear-gradient(135deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.06) 100%);backdrop-filter:blur(20px);border:2px solid rgba(255,255,255,.18);border-radius:24px;padding:2rem;margin-bottom:2.5rem;box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.2),0 0 80px rgba(255,107,107,.1);position:relative;overflow:hidden}
form::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;background:linear-gradient(45deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff);border-radius:24px;z-index:-1;opacity:0;transition:opacity .3s ease}
form:hover::before{opacity:.3}
.form-inner{display:flex;gap:1rem;align-items:stretch}
input[type=text]{flex:1;padding:1.2rem 1.5rem;border-radius:16px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.98);color:#1a1a1a;font-size:1.05rem;font-family:'Poppins',sans-serif;font-weight:500;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 15px rgba(0,0,0,.1)}
input[type=text]:focus{outline:none;border-color:#ffd93d;box-shadow:0 0 0 4px rgba(255,217,61,.25),0 8px 25px rgba(0,0,0,.15);transform:translateY(-2px);background:#fff}
input[type=text]::placeholder{color:#888;font-weight:400}
button{padding:1.2rem 2.5rem;border-radius:16px;border:none;background:linear-gradient(135deg,#ff6b6b 0%,#ee5a52 100%);color:#fff;font-size:1.05rem;font-weight:700;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 6px 20px rgba(255,107,107,.4);font-family:'Poppins',sans-serif;letter-spacing:.3px;position:relative;overflow:hidden}
button::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,.3);transform:translate(-50%,-50%);transition:width .6s,height .6s}
button:hover::before{width:300px;height:300px}
button:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(255,107,107,.6)}
button:active{transform:translateY(-1px)}
main{display:grid;gap:1.2rem}
.msg{background:linear-gradient(135deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.08) 100%);backdrop-filter:blur(15px);padding:1.8rem;border-radius:20px;border:1px solid rgba(255,255,255,.2);box-shadow:0 8px 32px rgba(0,0,0,.3);transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;animation:fadeInUp .6s ease backwards;font-size:1.05rem;line-height:1.6;color:#f0f0f0}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.msg::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff,#ff6b6b);background-size:200% 200%;animation:shimmer 3s linear infinite}
@keyframes shimmer{0%{background-position:0% 0%}100%{background-position:200% 0%}}
.msg::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,rgba(255,217,61,.15),transparent 70%);transform:translate(-50%,-50%);transition:width .6s ease,height .6s ease;pointer-events:none}
.msg:hover::after{width:400px;height:400px}
.msg:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 16px 48px rgba(0,0,0,.4);border-color:rgba(255,217,61,.5);background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,.1) 100%)}
.time{font-size:.9rem;color:#ffd93d;margin-top:1rem;opacity:.9;font-weight:600;display:flex;align-items:center;gap:.5rem;letter-spacing:.3px}
.time::before{content:'🎁';font-size:1rem}
.snow{position:fixed;color:#fff;z-index:9999;pointer-events:none;user-select:none;animation:fall linear infinite}
@keyframes fall{0%{transform:translateY(-10vh) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}
.lights{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.light{position:absolute;width:8px;height:8px;border-radius:50%;animation:twinkle 2s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
.empty{text-align:center;padding:5rem 2rem;font-size:1.3rem;color:rgba(255,255,255,.5);font-weight:600;letter-spacing:.5px}
@media(max-width:768px){h1{font-size:3rem;letter-spacing:-1px}.subtitle{font-size:1.1rem}.form-inner{flex-direction:column}button{width:100%;padding:1.1rem}.msg{padding:1.5rem;font-size:1rem}}
@media(max-width:480px){h1{font-size:2.3rem}.subtitle{font-size:1rem}form{padding:1.5rem}.ornaments{font-size:2rem;top:-20px}}
</style>
</head>
<body>
<div class="lights" id="lights"></div>
<div class="container">
<div class="header">
<div class="ornaments">🎄 ⛄ 🎅 🦌 🔔 🎁 ⭐</div>
<h1>FestiveWall</h1>
<p class="subtitle">✨ Spread Holiday Magic ✨</p>
</div>
<form method="POST">
<div class="form-inner">
<input name="message" type="text" placeholder="Share your festive wishes..." required maxlength="500" autocomplete="off">
<button type="submit">🎄 Post</button>
</div>
</form>
<main>` + (messagesHtml || '<div class="empty">🎅 Be the first to share some holiday joy! 🎄</div>') + `</main>
</div>
<script>
function createSnowflake(){var s=document.createElement('div');s.className='snow';var flakes=['❄','❅','❆'];s.textContent=flakes[Math.floor(Math.random()*3)];s.style.left=Math.random()*100+'vw';s.style.fontSize=Math.random()*15+8+'px';s.style.opacity=Math.random()*.7+.3;s.style.animationDuration=Math.random()*5+8+'s';s.style.filter='blur('+Math.random()*2+'px)';document.body.appendChild(s);setTimeout(function(){s.remove()},13000)}
setInterval(createSnowflake,200);
var l=document.getElementById('lights');
var c=['#ff6b6b','#ffd93d','#6bcf7f','#4d96ff','#ff8c42'];
for(var i=0;i<25;i++){var d=document.createElement('div');d.className='light';d.style.left=Math.random()*100+'%';d.style.top=Math.random()*100+'%';d.style.background=c[Math.floor(Math.random()*c.length)];d.style.boxShadow='0 0 20px currentColor';d.style.animationDelay=Math.random()*2+'s';l.appendChild(d)}
var msgs=document.querySelectorAll('.msg');for(var j=0;j<msgs.length;j++){msgs[j].style.animationDelay=j*.08+'s'}
</script>
</body>
</html>`;

    return new Response(html, {headers: {"Content-Type": "text/html; charset=utf-8"}});
  }
};
```*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;min-height:100vh;background:#0a1628;color:#fff;padding:2rem 1rem;position:relative;overflow-x:hidden}
body::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at top left,rgba(139,69,19,.15),transparent 50%),radial-gradient(ellipse at top right,rgba(25,135,84,.15),transparent 50%),radial-gradient(ellipse at bottom,rgba(220,20,60,.12),transparent 60%);pointer-events:none}
.container{max-width:900px;margin:0 auto;position:relative;z-index:1}
.header{text-align:center;margin-bottom:3rem;position:relative}
h1{font-size:4.5rem;margin-bottom:.5rem;background:linear-gradient(135deg,#ff6b6b 0%,#ffd93d 25%,#6bcf7f 50%,#4d96ff 75%,#ff6b6b 100%);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rainbow 4s ease infinite;font-weight:800;letter-spacing:-2px;filter:drop-shadow(0 0 20px rgba(255,107,107,.4))}
@keyframes rainbow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.subtitle{font-size:1.3rem;color:#ffd93d;opacity:.95;font-weight:600;text-shadow:0 2px 10px rgba(255,217,61,.3);letter-spacing:.5px}
.ornaments{position:absolute;top:-30px;width:100%;display:flex;justify-content:space-around;font-size:2.5rem;animation:sway 3s ease-in-out infinite}
@keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
form{background:linear-gradient(135deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.06) 100%);backdrop-filter:blur(20px);border:2px solid rgba(255,255,255,.18);border-radius:24px;padding:2rem;margin-bottom:2.5rem;box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.2),0 0 80px rgba(255,107,107,.1);position:relative;overflow:hidden}
form::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;background:linear-gradient(45deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff);border-radius:24px;z-index:-1;opacity:0;transition:opacity .3s ease}
form:hover::before{opacity:.3}
.form-inner{display:flex;gap:1rem;align-items:stretch}
input[type=text]{flex:1;padding:1.2rem 1.5rem;border-radius:16px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.98);color:#1a1a1a;font-size:1.05rem;font-family:'Poppins',sans-serif;font-weight:500;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 15px rgba(0,0,0,.1)}
input[type=text]:focus{outline:none;border-color:#ffd93d;box-shadow:0 0 0 4px rgba(255,217,61,.25),0 8px 25px rgba(0,0,0,.15);transform:translateY(-2px);background:#fff}
input[type=text]::placeholder{color:#888;font-weight:400}
button{padding:1.2rem 2.5rem;border-radius:16px;border:none;background:linear-gradient(135deg,#ff6b6b 0%,#ee5a52 100%);color:#fff;font-size:1.05rem;font-weight:700;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 6px 20px rgba(255,107,107,.4);font-family:'Poppins',sans-serif;letter-spacing:.3px;position:relative;overflow:hidden}
button::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,.3);transform:translate(-50%,-50%);transition:width .6s,height .6s}
button:hover::before{width:300px;height:300px}
button:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(255,107,107,.6)}
button:active{transform:translateY(-1px)}
main{display:grid;gap:1.2rem}
.msg{background:linear-gradient(135deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.08) 100%);backdrop-filter:blur(15px);padding:1.8rem;border-radius:20px;border:1px solid rgba(255,255,255,.2);box-shadow:0 8px 32px rgba(0,0,0,.3);transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;animation:fadeInUp .6s ease backwards;font-size:1.05rem;line-height:1.6;color:#f0f0f0}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.msg::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff,#ff6b6b);background-size:200% 200%;animation:shimmer 3s linear infinite}
@keyframes shimmer{0%{background-position:0% 0%}100%{background-position:200% 0%}}
.msg::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,rgba(255,217,61,.15),transparent 70%);transform:translate(-50%,-50%);transition:width .6s ease,height .6s ease;pointer-events:none}
.msg:hover::after{width:400px;height:400px}
.msg:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 16px 48px rgba(0,0,0,.4);border-color:rgba(255,217,61,.5);background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,.1) 100%)}
.time{font-size:.9rem;color:#ffd93d;margin-top:1rem;opacity:.9;font-weight:600;display:flex;align-items:center;gap:.5rem;letter-spacing:.3px}
.time::before{content:'🎁';font-size:1rem}
.snow{position:fixed;color:#fff;z-index:9999;pointer-events:none;user-select:none;animation:fall linear infinite}
@keyframes fall{0%{transform:translateY(-10vh) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}
.lights{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.light{position:absolute;width:8px;height:8px;border-radius:50%;animation:twinkle 2s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
.empty{text-align:center;padding:5rem 2rem;font-size:1.3rem;color:rgba(255,255,255,.5);font-weight:600;letter-spacing:.5px}
@media(max-width:768px){h1{font-size:3rem;letter-spacing:-1px}.subtitle{font-size:1.1rem}.form-inner{flex-direction:column}button{width:100%;padding:1.1rem}.msg{padding:1.5rem;font-size:1rem}}
@media(max-width:480px){h1{font-size:2.3rem}.subtitle{font-size:1rem}form{padding:1.5rem}.ornaments{font-size:2rem;top:-20px}}
</style>
</head>
<body>
<div class="lights" id="lights"></div>
<div class="container">
<div class="header">
<div class="ornaments">🎄 ⛄ 🎅 🦌 🔔 🎁 ⭐</div>
<h1>FestiveWall</h1>
<p class="subtitle">✨ Spread Holiday Magic ✨</p>
</div>
<form method="POST">
<div class="form-inner">
<input name="message" type="text" placeholder="Share your festive wishes..." required maxlength="500" autocomplete="off">
<button type="submit">🎄 Post</button>
</div>
</form>
<main>${messagesHtml || '<div class="empty">🎅 Be the first to share some holiday joy! 🎄</div>'}</main>
</div>
<script>
function createSnowflake(){const s=document.createElement('div');s.className='snow';s.textContent=['❄','❅','❆'][Math.floor(Math.random()*3)];s.style.left=Math.random()*100+'vw';s.style.fontSize=Math.random()*15+8+'px';s.style.opacity=Math.random()*.7+.3;s.style.animationDuration=Math.random()*5+8+'s';s.style.filter='blur('+Math.random()*2+'px)';document.body.appendChild(s);setTimeout(function(){s.remove()},13000)}
setInterval(createSnowflake,200);
const l=document.getElementById('lights');
const c=['#ff6b6b','#ffd93d','#6bcf7f','#4d96ff','#ff8c42'];
for(let i=0;i<25;i++){const d=document.createElement('div');d.className='light';d.style.left=Math.random()*100+'%';d.style.top=Math.random()*100+'%';d.style.background=c[Math.floor(Math.random()*c.length)];d.style.boxShadow='0 0 20px currentColor';d.style.animationDelay=Math.random()*2+'s';l.appendChild(d)}
document.querySelectorAll('.msg').forEach(function(m,i){m.style.animationDelay=i*.08+'s'});
</script>
</body>
</html>`;

    return new Response(html, {headers: {"Content-Type": "text/html; charset=utf-8"}});
  }
};
```*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;min-height:100vh;background:#0a1628;color:#fff;padding:2rem 1rem;position:relative;overflow-x:hidden}
body::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at top left,rgba(139,69,19,.15),transparent 50%),radial-gradient(ellipse at top right,rgba(25,135,84,.15),transparent 50%),radial-gradient(ellipse at bottom,rgba(220,20,60,.12),transparent 60%);pointer-events:none}
.container{max-width:900px;margin:0 auto;position:relative;z-index:1}
.header{text-align:center;margin-bottom:3rem;position:relative}
h1{font-size:4.5rem;margin-bottom:.5rem;background:linear-gradient(135deg,#ff6b6b 0%,#ffd93d 25%,#6bcf7f 50%,#4d96ff 75%,#ff6b6b 100%);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rainbow 4s ease infinite;font-weight:800;letter-spacing:-2px;filter:drop-shadow(0 0 20px rgba(255,107,107,.4))}
@keyframes rainbow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.subtitle{font-size:1.3rem;color:#ffd93d;opacity:.95;font-weight:600;text-shadow:0 2px 10px rgba(255,217,61,.3);letter-spacing:.5px}
.ornaments{position:absolute;top:-30px;width:100%;display:flex;justify-content:space-around;font-size:2.5rem;animation:sway 3s ease-in-out infinite}
@keyframes sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
form{background:linear-gradient(135deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.06) 100%);backdrop-filter:blur(20px);border:2px solid rgba(255,255,255,.18);border-radius:24px;padding:2rem;margin-bottom:2.5rem;box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.2),0 0 80px rgba(255,107,107,.1);position:relative;overflow:hidden}
form::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;background:linear-gradient(45deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff);border-radius:24px;z-index:-1;opacity:0;transition:opacity .3s ease}
form:hover::before{opacity:.3}
.form-inner{display:flex;gap:1rem;align-items:stretch}
input[type=text]{flex:1;padding:1.2rem 1.5rem;border-radius:16px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.98);color:#1a1a1a;font-size:1.05rem;font-family:'Poppins',sans-serif;font-weight:500;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 15px rgba(0,0,0,.1)}
input[type=text]:focus{outline:none;border-color:#ffd93d;box-shadow:0 0 0 4px rgba(255,217,61,.25),0 8px 25px rgba(0,0,0,.15);transform:translateY(-2px);background:#fff}
input[type=text]::placeholder{color:#888;font-weight:400}
button{padding:1.2rem 2.5rem;border-radius:16px;border:none;background:linear-gradient(135deg,#ff6b6b 0%,#ee5a52 100%);color:#fff;font-size:1.05rem;font-weight:700;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 6px 20px rgba(255,107,107,.4);font-family:'Poppins',sans-serif;letter-spacing:.3px;position:relative;overflow:hidden}
button::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,.3);transform:translate(-50%,-50%);transition:width .6s,height .6s}
button:hover::before{width:300px;height:300px}
button:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(255,107,107,.6)}
button:active{transform:translateY(-1px)}
main{display:grid;gap:1.2rem}
.msg{background:linear-gradient(135deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.08) 100%);backdrop-filter:blur(15px);padding:1.8rem;border-radius:20px;border:1px solid rgba(255,255,255,.2);box-shadow:0 8px 32px rgba(0,0,0,.3);transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;animation:fadeInUp .6s ease backwards;font-size:1.05rem;line-height:1.6;color:#f0f0f0}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.msg::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff,#ff6b6b);background-size:200% 200%;animation:shimmer 3s linear infinite}
@keyframes shimmer{0%{background-position:0% 0%}100%{background-position:200% 0%}}
.msg::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,rgba(255,217,61,.15),transparent 70%);transform:translate(-50%,-50%);transition:width .6s ease,height .6s ease;pointer-events:none}
.msg:hover::after{width:400px;height:400px}
.msg:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 16px 48px rgba(0,0,0,.4);border-color:rgba(255,217,61,.5);background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,.1) 100%)}
.time{font-size:.9rem;color:#ffd93d;margin-top:1rem;opacity:.9;font-weight:600;display:flex;align-items:center;gap:.5rem;letter-spacing:.3px}
.time::before{content:'🎁';font-size:1rem}
.snow{position:fixed;color:#fff;z-index:9999;pointer-events:none;user-select:none;animation:fall linear infinite}
@keyframes fall{0%{transform:translateY(-10vh) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}
.lights{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.light{position:absolute;width:8px;height:8px;border-radius:50%;animation:twinkle 2s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
.empty{text-align:center;padding:5rem 2rem;font-size:1.3rem;color:rgba(255,255,255,.5);font-weight:600;letter-spacing:.5px}
@media(max-width:768px){h1{font-size:3rem;letter-spacing:-1px}.subtitle{font-size:1.1rem}.form-inner{flex-direction:column}button{width:100%;padding:1.1rem}.msg{padding:1.5rem;font-size:1rem}}
@media(max-width:480px){h1{font-size:2.3rem}.subtitle{font-size:1rem}form{padding:1.5rem}.ornaments{font-size:2rem;top:-20px}}
</style>
</head>
<body>
<div class="lights" id="lights"></div>
<div class="container">
<div class="header">
<div class="ornaments">🎄 ⛄ 🎅 🦌 🔔 🎁 ⭐</div>
<h1>FestiveWall</h1>
<p class="subtitle">✨ Spread Holiday Magic ✨</p>
</div>
<form method="POST">
<div class="form-inner">
<input name="message" type="text" placeholder="Share your festive wishes..." required maxlength="500" autocomplete="off">
<button type="submit">🎄 Post</button>
</div>
</form>
<main>${messagesHtml || '<div class="empty">🎅 Be the first to share some holiday joy! 🎄</div>'}</main>
</div>
<script>
function createSnowflake(){const snow=document.createElement('div');snow.className='snow';snow.textContent=['❄','❅','❆'][Math.floor(Math.random()*3)];snow.style.left=Math.random()*100+'vw';snow.style.fontSize=Math.random()*15+8+'px';snow.style.opacity=Math.random()*.7+.3;snow.style.animationDuration=Math.random()*5+8+'s';snow.style.filter='blur('+Math.random()*2+'px)';document.body.appendChild(snow);setTimeout(()=>snow.remove(),13000)}
setInterval(createSnowflake,200);
const lights=document.getElementById('lights');
const colors=['#ff6b6b','#ffd93d','#6bcf7f','#4d96ff','#ff8c42'];
for(let i=0;i<25;i++){const light=document.createElement('div');light.className='light';light.style.left=Math.random()*100+'%';light.style.top=Math.random()*100+'%';light.style.background=colors[Math.floor(Math.random()*colors.length)];light.style.boxShadow='0 0 20px currentColor';light.style.animationDelay=Math.random()*2+'s';lights.appendChild(light)}
document.querySelectorAll('.msg').forEach((msg,i)=>{msg.style.animationDelay=i*.08+'s'});
</script>
</body>
</html>`;

    return new Response(html, {headers: {"Content-Type": "text/html; charset=utf-8"}});
  }
};
```            r.created_at
          )}</div></div>`
      )
      .join("");

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FestiveWall 🎄</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:'Poppins',sans-serif;
  min-height:100vh;
  background:#0a1628;
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
    radial-gradient(ellipse at top left,rgba(139,69,19,.15),transparent 50%),
    radial-gradient(ellipse at top right,rgba(25,135,84,.15),transparent 50%),
    radial-gradient(ellipse at bottom,rgba(220,20,60,.12),transparent 60%);
  pointer-events:none
}
.container{max-width:900px;margin:0 auto;position:relative;z-index:1}
.header{
  text-align:center;
  margin-bottom:3rem;
  position:relative
}
h1{
  font-size:4.5rem;
  margin-bottom:.5rem;
  background:linear-gradient(135deg,#ff6b6b 0%,#ffd93d 25%,#6bcf7f 50%,#4d96ff 75%,#ff6b6b 100%);
  background-size:300% 300%;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:rainbow 4s ease infinite;
  font-weight:800;
  letter-spacing:-2px;
  filter:drop-shadow(0 0 20px rgba(255,107,107,.4))
}
@keyframes rainbow{
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
.subtitle{
  font-size:1.3rem;
  color:#ffd93d;
  opacity:.95;
  font-weight:600;
  text-shadow:0 2px 10px rgba(255,217,61,.3);
  letter-spacing:.5px
}
.ornaments{
  position:absolute;
  top:-30px;
  width:100%;
  display:flex;
  justify-content:space-around;
  font-size:2.5rem;
  animation:sway 3s ease-in-out infinite
}
@keyframes sway{
  0%,100%{transform:rotate(-2deg)}
  50%{transform:rotate(2deg)}
}
form{
  background:linear-gradient(135deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.06) 100%);
  backdrop-filter:blur(20px);
  border:2px solid rgba(255,255,255,.18);
  border-radius:24px;
  padding:2rem;
  margin-bottom:2.5rem;
  box-shadow:
    0 8px 32px rgba(0,0,0,.4),
    inset 0 1px 0 rgba(255,255,255,.2),
    0 0 80px rgba(255,107,107,.1);
  position:relative;
  overflow:hidden
}
form::before{
  content:'';
  position:absolute;
  top:-2px;
  left:-2px;
  right:-2px;
  bottom:-2px;
  background:linear-gradient(45deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff);
  border-radius:24px;
  z-index:-1;
  opacity:0;
  transition:opacity .3s ease
}
form:hover::before{opacity:.3}
.form-inner{display:flex;gap:1rem;align-items:stretch}
input[type=text]{
  flex:1;
  padding:1.2rem 1.5rem;
  border-radius:16px;
  border:2px solid rgba(255,255,255,.25);
  background:rgba(255,255,255,.98);
  color:#1a1a1a;
  font-size:1.05rem;
  font-family:'Poppins',sans-serif;
  font-weight:500;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  box-shadow:0 4px 15px rgba(0,0,0,.1)
}
input[type=text]:focus{
  outline:none;
  border-color:#ffd93d;
  box-shadow:0 0 0 4px rgba(255,217,61,.25),0 8px 25px rgba(0,0,0,.15);
  transform:translateY(-2px);
  background:#fff
}
input[type=text]::placeholder{color:#888;font-weight:400}
button{
  padding:1.2rem 2.5rem;
  border-radius:16px;
  border:none;
  background:linear-gradient(135deg,#ff6b6b 0%,#ee5a52 100%);
  color:#fff;
  font-size:1.05rem;
  font-weight:700;
  cursor:pointer;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  box-shadow:0 6px 20px rgba(255,107,107,.4);
  font-family:'Poppins',sans-serif;
  letter-spacing:.3px;
  position:relative;
  overflow:hidden
}
button::before{
  content:'';
  position:absolute;
  top:50%;
  left:50%;
  width:0;
  height:0;
  border-radius:50%;
  background:rgba(255,255,255,.3);
  transform:translate(-50%,-50%);
  transition:width .6s,height .6s
}
button:hover::before{
  width:300px;
  height:300px
}
button:hover{
  transform:translateY(-3px);
  box-shadow:0 10px 30px rgba(255,107,107,.6)
}
button:active{transform:translateY(-1px)}
main{display:grid;gap:1.2rem}
.msg{
  background:linear-gradient(135deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.08) 100%);
  backdrop-filter:blur(15px);
  padding:1.8rem;
  border-radius:20px;
  border:1px solid rgba(255,255,255,.2);
  box-shadow:0 8px 32px rgba(0,0,0,.3);
  transition:all .4s cubic-bezier(.4,0,.2,1);
  position:relative;
  overflow:hidden;
  animation:fadeInUp .6s ease backwards;
  font-size:1.05rem;
  line-height:1.6;
  color:#f0f0f0
}
@keyframes fadeInUp{
  from{opacity:0;transform:translateY(30px)}
  to{opacity:1;transform:translateY(0)}
}
.msg::before{
  content:'';
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:4px;
  background:linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcf7f,#4d96ff,#ff6b6b);
  background-size:200% 200%;
  animation:shimmer 3s linear infinite
}
@keyframes shimmer{
  0%{background-position:0% 0%}
  100%{background-position:200% 0%}
}
.msg::after{
  content:'';
  position:absolute;
  top:50%;
  left:50%;
  width:0;
  height:0;
  border-radius:50%;
  background:radial-gradient(circle,rgba(255,217,61,.15),transparent 70%);
  transform:translate(-50%,-50%);
  transition:width .6s ease,height .6s ease;
  pointer-events:none
}
.msg:hover::after{
  width:400px;
  height:400px
}
.msg:hover{
  transform:translateY(-6px) scale(1.01);
  box-shadow:0 16px 48px rgba(0,0,0,.4);
  border-color:rgba(255,217,61,.5);
  background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,.1) 100%)
}
.time{
  font-size:.9rem;
  color:#ffd93d;
  margin-top:1rem;
  opacity:.9;
  font-weight:600;
  display:flex;
  align-items:center;
  gap:.5rem;
  letter-spacing:.3px
}
.time::before{
  content:'🎁';
  font-size:1rem
}
.snow{
  position:fixed;
  color:#fff;
  z-index:9999;
  pointer-events:none;
  user-select:none;
  animation:fall linear infinite
}
@keyframes fall{
  0%{transform:translateY(-10vh) rotate(0deg)}
  100%{transform:translateY(110vh) rotate(360deg)}
}
.lights{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  pointer-events:none;
  z-index:0;
  overflow:hidden
}
.light{
  position:absolute;
  width:8px;
  height:8px;
  border-radius:50%;
  animation:twinkle 2s ease-in-out infinite
}
@keyframes twinkle{
  0%,100%{opacity:.3;transform:scale(1)}
  50%{opacity:1;transform:scale(1.5)}
}
.empty{
  text-align:center;
  padding:5rem 2rem;
  font-size:1.3rem;
  color:rgba(255,255,255,.5);
  font-weight:600;
  letter-spacing:.5px
}
@media(max-width:768px){
  h1{font-size:3rem;letter-spacing:-1px}
  .subtitle{font-size:1.1rem}
  .form-inner{flex-direction:column}
  button{width:100%;padding:1.1rem}
  .msg{padding:1.5rem;font-size:1rem}
}
@media(max-width:480px){
  h1{font-size:2.3rem}
  .subtitle{font-size:1rem}
  form{padding:1.5rem}
  .ornaments{font-size:2rem;top:-20px}
}
</style>
</head><body>
<div class="lights" id="lights"></div>
<div class="container">
<div class="header">
<div class="ornaments">🎄 ⛄ 🎅 🦌 🔔 🎁 ⭐</div>
<h1>FestiveWall</h1>
<p class="subtitle">✨ Spread Holiday Magic ✨</p>
</div>
<form method="POST">
  <div class="form-inner">
    <input name="message" type="text" placeholder="Share your festive wishes..." required maxlength="500" autocomplete="off">
    <button type="submit">🎄 Post</button>
  </div>
</form>
<main>${messagesHtml || '<div class="empty">🎅 Be the first to share some holiday joy! 🎄</div>'}</main>
</div>
<script>
function createSnowflake(){
  const snow=document.createElement('div');
  snow.className='snow';
  snow.textContent=['❄','❅','❆'][Math.floor(Math.random()*3)];
  snow.style.left=Math.random()*100+'vw';
  snow.style.fontSize=Math.random()*15+8+'px';
  snow.style.opacity=Math.random()*.7+.3;
  snow.style.animationDuration=Math.random()*5+8+'s';
  snow.style.filter='blur('+Math.random()*2+'px)';
  document.body.appendChild(snow);
  setTimeout(()=>snow.remove(),13000)
}
setInterval(createSnowflake,200);
const lights=document.getElementById('lights');
const colors=['#ff6b6b','#ffd93d','#6bcf7f','#4d96ff','#ff8c42'];
for(let i=0;i<25;i++){
  const light=document.createElement('div');
  light.className='light';
  light.style.left=Math.random()*100+'%';
  light.style.top=Math.random()*100+'%';
  light.style.background=colors[Math.floor(Math.random()*colors.length)];
  light.style.boxShadow='0 0 20px currentColor';
  light.style.animationDelay=Math.random()*2+'s';
  lights.appendChild(light)
}
document.querySelectorAll('.msg').forEach((msg,i)=>{
  msg.style.animationDelay=i*.08+'s'
});
</script>
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
```      .map(
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
