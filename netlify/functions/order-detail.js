// netlify/functions/order-detail.js
// Нэг захиалгын бүрэн мэдээлэл (хуудасны өгөгдөл орсон) татаж авна. PIN шаардана.

exports.handler = async (event) => {
  const { JSONBIN_API_KEY, JSONBIN_ORDERS_BIN_ID, ADMIN_PIN } = process.env;
  const { pin, id } = event.queryStringParameters || {};

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "PIN буруу байна." }) };
  }
  if (!id) {
    return { statusCode: 400, body: "id parameter шаардлагатай" };
  }
  if (!JSONBIN_API_KEY || !JSONBIN_ORDERS_BIN_ID) {
    return { statusCode: 500, body: "Серверийн тохиргоо дутуу байна (JSONBin)." };
  }

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ORDERS_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY },
    });
    if (!res.ok) throw new Error(`JSONBin read failed: ${res.status}`);
    const data = await res.json();
    const orders = data.record && Array.isArray(data.record.orders) ? data.record.orders : [];
    const order = orders.find((o) => o.id === id);
    if (!order) {
      return { statusCode: 404, body: JSON.stringify({ error: "Захиалга олдсонгүй." }) };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Захиалга татахад алдаа гарлаа." };
  }
};
