// netlify/functions/instagram-callback.js
// Instagram зөвшөөрлийн хуудаснаас буцаж ирэхэд ажиллана.
// Богино хугацааны token-г урт хугацааны (60 хоног) token болгож
// хөрвүүлээд, хэрэглэгчийн browser дээр HttpOnly cookie-д хадгална.

exports.handler = async (event) => {
  const { IG_APP_ID, IG_APP_SECRET, IG_REDIRECT_URI } = process.env;
  const { code, state, error } = event.queryStringParameters || {};

  if (error) {
    return redirectWithMessage("Instagram зөвшөөрөл өгөхөөс татгалзсан байна.");
  }
  if (!code) {
    return redirectWithMessage("Код олдсонгүй. Дахин оролдоно уу.");
  }

  try {
    // 1. Богино хугацааны token авах
    const form = new URLSearchParams({
      client_id: IG_APP_ID,
      client_secret: IG_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: IG_REDIRECT_URI,
      code,
    });

    const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const shortData = await shortRes.json();
    if (!shortData.access_token) {
      console.error("short token error", shortData);
      return redirectWithMessage("Token авахад алдаа гарлаа.");
    }

    // 2. Урт хугацааны (60 хоног) token болгож солих
    const longUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${IG_APP_SECRET}&access_token=${shortData.access_token}`;
    const longRes = await fetch(longUrl);
    const longData = await longRes.json();
    if (!longData.access_token) {
      console.error("long token error", longData);
      return redirectWithMessage("Урт хугацааны token авахад алдаа гарлаа.");
    }

    // 3. Cookie-д хадгалаад dashboard руу буцаах
    return {
      statusCode: 302,
      headers: {
        Location: "/?connected=1",
        "Set-Cookie": `ig_token=${longData.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 24 * 60 * 60}`,
      },
      body: "",
    };
  } catch (err) {
    console.error(err);
    return redirectWithMessage("Тодорхойгүй алдаа гарлаа.");
  }
};

function redirectWithMessage(msg) {
  return {
    statusCode: 302,
    headers: { Location: `/?error=${encodeURIComponent(msg)}` },
    body: "",
  };
}
