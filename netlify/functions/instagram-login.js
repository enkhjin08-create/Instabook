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

  // CSRF-ээс хамгаалах санамсаргүй state утга
  const state = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_id: IG_APP_ID,
    redirect_uri: IG_REDIRECT_URI,
    response_type: "code",
    // Зураг + профайл унших зөвшөөрөл (зөвхөн уншина, нийтлэхгүй)
    scope: "instagram_business_basic",
    state,
  });

  const authorizeUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

  return {
    statusCode: 302,
    headers: {
      Location: authorizeUrl,
      "Set-Cookie": `ig_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
    body: "",
  };
};
