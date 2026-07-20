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

  // Серверийн талд iOS Safari эсэхийг шалгана (Chrome/Firefox for iOS-г хасна,
  // учир нь тэдгээр нь UA дотроо CriOS/FxiOS агуулдаг).
  const ua = (event.headers["user-agent"] || event.headers["User-Agent"] || "");
  const isIOS = /iP(hone|od|ad)/.test(ua);
  const isIOSSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

  // iOS Safari дээр Instagram апп Universal Link-ээр барьж аваад
  // зөвшөөрлийн дэлгэц харуулахгүй апп руу шидчихдэг тул x-safari-https
  // scheme ашиглан Safari дотроо албадан нээнэ. Энэ trick нь ЗӨВХӨН
  // хэрэглэгчийн ЖИНХЭНЭ товшилтоор ажилладаг тул автомат JS redirect хийхгүй.
  const linkUrl = isIOSSafari ? authorizeUrl.replace(/^https:\/\//, "x-safari-https://") : authorizeUrl;

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Instagram холбох</title>
<style>
  body{
    font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;
    background:#FBF7F0;color:#2B2420;display:flex;flex-direction:column;
    align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;
  }
  h1{font-size:19px;margin-bottom:10px;}
  p{color:#6b5f56;font-size:14px;max-width:300px;margin-bottom:22px;line-height:1.5;}
  a.go{
    display:inline-block;background:#7E2F42;color:#fff;font-weight:600;font-size:15px;
    padding:14px 30px;border-radius:999px;text-decoration:none;
  }
  .tip{margin-top:22px;font-size:12.5px;color:#9c8f83;max-width:280px;line-height:1.6;}
  .tip b{color:#6b5f56;}
</style>
</head>
<body>
  <h1>Instagram холбох</h1>
  <p>Доорх товчийг дарж Instagram-ийн зөвшөөрлийн хуудас руу шилжинэ үү.</p>
  <a class="go" href="${linkUrl}">Instagram руу үргэлжлүүлэх</a>

  <p class="tip">
    Хэрэв товчийг дарахад зөвхөн Instagram апп нээгдээд юу ч болохгүй бол:
    линк дээр <b>хуруугаараа удаан дараад</b> ("long press") гарч ирэх цэснээс
    <b>"Open in Safari"</b> (эсвэл "Ил задлах") гэдгийг сонгоно уу.
  </p>
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
