// netlify/functions/order-list.js
// Admin-д зориулсан захиалгын жагсаалт. PIN шаардана.

exports.handler = async (event) => {
  const { JSONBIN_API_KEY, JSONBIN_ORDERS_BIN_ID, ADMIN_PIN } = process.env;
  const pin = event.queryStringParameters && event.queryStringParameters.pin;

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "PIN буруу байна." }) };
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
    // Жагсаалтад зургийн дэлгэрэнгүйг оруулахгүй, зөвхөн товч мэдээлэл (хурдан ачаалахын тулд)
    const summary = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
      pageCount: o.pageCount,
      status: o.status,
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: summary }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Захиалга татахад алдаа гарлаа." };
  }
};
