// netlify/functions/order-update.js
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

  const { ADMIN_PIN } = process.env;
  const { pin, id, status } = payload;

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "PIN буруу байна." }) };
  }
  if (!id || !status) {
    return { statusCode: 400, body: "id болон status шаардлагатай" };
  }

  try {
    const db = getDb();
    const docRef = db.collection("orders").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Захиалга олдсонгүй." }) };
    }
    await docRef.update({ status });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: `Шинэчлэхэд алдаа гарлаа: ${err.message}` };
  }
};
