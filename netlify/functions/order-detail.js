// netlify/functions/order-detail.js
const { getDb } = require("./_shared/firebase");

exports.handler = async (event) => {
  const { ADMIN_PIN } = process.env;
  const { pin, id } = event.queryStringParameters || {};

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "PIN буруу байна." }) };
  }
  if (!id) {
    return { statusCode: 400, body: "id parameter шаардлагатай" };
  }

  try {
    const db = getDb();
    const doc = await db.collection("orders").doc(id).get();
    if (!doc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Захиалга олдсонгүй." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: { id: doc.id, ...doc.data() } }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: `Захиалга татахад алдаа гарлаа: ${err.message}` };
  }
};
