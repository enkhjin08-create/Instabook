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

    // CAROUSEL_ALBUM (олон зурагтай) постуудын БҮХ дэд-зургийг татаж авна —
    // ингэснээр тухайн постыг нэг хуудсан дээр collage болгож болно.
    // (Мөн зарим тохиолдолд эцэг пост дээр media_url огт ирдэггүй Instagram
    // талын алдааг ч энэ мөрөөр шийднэ — эхний дэд-зургийг эцгийн media_url
    // болгож ашиглана.)
    const carousels = all.filter((m) => m.media_type === "CAROUSEL_ALBUM");
    for (const m of carousels) {
      try {
        const childUrl = `https://graph.instagram.com/${m.id}/children?fields=id,media_url,thumbnail_url,media_type&access_token=${token}`;
        const childRes = await fetch(childUrl);
        const childData = await childRes.json();
        const children = (childData.data || []).filter((c) => c.media_url);
        if (children.length > 0) {
          m.children = children.slice(0, 4); // хуудсанд дээд тал нь 4 зураг багтана
          if (!m.media_url) m.media_url = children[0].media_url;
          if (!m.thumbnail_url) m.thumbnail_url = children[0].thumbnail_url;
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
