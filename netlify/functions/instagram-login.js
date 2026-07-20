// netlify/functions/instagram-login.js
// Хэрэглэгч "Instagram холбох" товч дархад энэ функц ажиллаж,
// тэднийг Instagram-ийн зөвшөөрлийн хуудас руу чиглүүлнэ.

exports.handler = async (event) => {
  const { IG_APP_ID, IG_REDIRECT_URI } = process.env;

  if (!IG_APP_ID || !IG_REDIRECT_URI) {
    return {
      statusCode: 500,
      body: "Тохиргоо дутуу байна: IG_APP_ID эсвэл IG_REDIRECT_URI environment variable Netlify дээр тохируулаагүй байна.",
    };
  }

  const state = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_id: IG_APP_ID,
    redirect_uri: IG_REDIRECT_URI,
    response_type: "code",
    scope: "instagram_business_basic",
    state,
  });

  const authorizeUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  // iOS дээр Instagram апп суулгасан байвал шууд redirect хийхэд Universal Link
  // барьж аваад зөвшөөрлийн дэлгэц харуулахгүйгээр апп руу шидчихдэг тул,
  // x-safari-https:// scheme ашиглан Safari дээр л нээгдэхийг албадана.
  const safariUrl = authorizeUrl.replace(/^https:\/\//, "x-safari-https://");

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Instagram руу шилжиж байна...</title>
<style>
  body{
    font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;
    background:#FBF7F0;color:#2B2420;display:flex;flex-direction:column;
    align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;
  }
  .spinner{
    width:32px;height:32px;border:3px solid #e6dcc9;border-top-color:#7E2F42;
    border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:18px;
  }
  @keyframes spin{to{transform:rotate(360deg);}}
  p{color:#6b5f56;font-size:14px;max-width:280px;}
  a.manual{
    margin-top:16px;color:#7E2F42;font-weight:600;text-decoration:underline;font-size:14px;
  }
</style>
</head>
<body>
  <div class="spinner"></div>
  <p>Instagram-ийн зөвшөөрлийн хуудас руу шилжиж байна...</p>
  <a class="manual" id="manualLink" href="${authorizeUrl}">Автоматаар шилжихгүй бол энд дарна уу</a>

  <script>
    (function () {
      var isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
      var isSafari = isIOS && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
      var target = isSafari ? "${safariUrl}" : "${authorizeUrl}";
      document.getElementById('manualLink').href = target;
      // Хэрэглэгчийн "trusted" tap-тай төстэй болгохын тулд жаахан хойшлуулаад шилжинэ
      setTimeout(function () {
        window.location.href = target;
      }, 300);
    })();
  </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": `ig_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
    body: html,
  };
};
