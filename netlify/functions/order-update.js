// netlify/functions/order-update.js
// Захиалгын статусыг шинэчилнэ (жишээ нь "done" гэж тэмдэглэх). PIN шаардана.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { JSONBIN_API_KEY, JSONBIN_ORDERS_BIN_ID, ADMIN_PIN } = process.env;

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Буруу өгөгдөл" };
  }

  const { pin, id, status } = payload;
  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "PIN буруу байна." }) };
  }
  if (!id || !status) {
    return { statusCode: 400, body: "id болон status шаардлагатай" };
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
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) {
      return { statusCode: 404, body: JSON.stringify({ error: "Захиалга олдсонгүй." }) };
    }
    orders[idx].status = status;

    const putRes = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ORDERS_BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify({ orders }),
    });
    if (!putRes.ok) throw new Error(`JSONBin write failed: ${putRes.status}`);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Шинэчлэхэд алдаа гарлаа." };
  }
};
