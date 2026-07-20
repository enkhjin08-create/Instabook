// netlify/functions/instagram-media.js
// Холбогдсон Instagram акаунтын зургуудын жагсаалтыг буцаана.

exports.handler = async (event) => {
  const token = getCookie(event.headers.cookie, "ig_token");
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: "Instagram холбогдоогүй байна." }) };
  }

  try {
    let url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=50&access_token=${token}`;
    let all = [];

    // Дараагийн хуудсуудыг дагаж (pagination) хамгийн ихдээ 200 зураг татна
    for (let i = 0; i < 4 && url; i++) {
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };
      }
      const items = (data.data || []).filter(
        (m) => m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM"
      );
      all = all.concat(items);
      url = data.paging && data.paging.next ? data.paging.next : null;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media: all }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Зураг татахад алдаа гарлаа." }) };
  }
};

function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
