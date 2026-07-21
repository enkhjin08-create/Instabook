// netlify/functions/image-proxy.js
// Instagram-ийн зургийг манай сервер дамжуулан дахин серв хийж,
// зөв CORS header-тэй болгоно. Энэ нь PDF үүсгэхэд ашигладаг
// html2canvas сан cross-origin зурагтай ажиллах үед canvas
// "бохирдох" (tainted) асуудлаас сэргийлнэ.

exports.handler = async (event) => {
  const url = event.queryStringParameters && event.queryStringParameters.url;

  if (!url) {
    return { statusCode: 400, body: "url parameter шаардлагатай" };
  }

  // Зөвхөн Instagram/Facebook CDN домэйнээс зөвшөөрнө (аюулгүй байдлын үүднээс)
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return { statusCode: 400, body: "Буруу URL" };
  }
  const allowedHosts = /(cdninstagram\.com|fbcdn\.net)$/i;
  if (!allowedHosts.test(parsed.hostname)) {
    return { statusCode: 403, body: "Зөвшөөрөгдөөгүй домэйн" };
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: res.status, body: "Эх зургийг татаж чадсангүй" };
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await res.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Proxy алдаа гарлаа" };
  }
};
