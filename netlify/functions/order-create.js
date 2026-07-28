// netlify/functions/order-create.js
const { getDb } = require("./_shared/firebase");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Буруу өгөгдөл" };
  }

  const { customerName, phone, address, pages, mediaSnapshot } = payload;
  if (!phone || !pages || !Array.isArray(pages) || pages.length === 0) {
    return { statusCode: 400, body: "Утасны дугаар болон дор хаяж 1 хуудас шаардлагатай." };
  }

  try {
    const db = getDb();
    const docRef = await db.collection("orders").add({
      createdAt: new Date().toISOString(),
      customerName: customerName || "",
      phone,
      address: address || "",
      pageCount: pages.length,
      pages,
      mediaSnapshot: Array.isArray(mediaSnapshot) ? mediaSnapshot : [],
      status: "pending",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, orderId: docRef.id }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: `Захиалга хадгалахад алдаа гарлаа: ${err.message}` };
  }
};
