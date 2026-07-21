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

    // Зарим CAROUSEL_ALBUM (олон зурагтай) пост дээр Instagram талын алдаанаас
    // болж media_url огт ирдэггүй тохиолдол байдаг тул, дутуу байгаа зурагны
    // эхний дэд-зургийг тусад нь татаж нөхнө.
    const missing = all.filter((m) => !m.media_url && !m.thumbnail_url);
    for (const m of missing) {
      try {
        const childUrl = `https://graph.instagram.com/${m.id}/children?fields=media_url,media_type&access_token=${token}`;
        const childRes = await fetch(childUrl);
        const childData = await childRes.json();
        const firstChild = childData.data && childData.data[0];
        if (firstChild && firstChild.media_url) {
          m.media_url = firstChild.media_url;
        }
      } catch (e) {
        // Тухайн зургийг алгасаад үргэлжлүүлнэ, бүх жагсаалтыг зогсоохгүй
        console.error("child fetch failed for", m.id, e);
      }
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
