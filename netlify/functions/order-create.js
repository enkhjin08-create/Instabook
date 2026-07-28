// netlify/functions/order-create.js
// Захиалагчийн сонгосон зурган хуудсууд + холбоо барих мэдээллийг
// JSONBin-д хадгална. Admin дараа нь эдгээрийг харж, PDF үүсгэнэ.

const JSONBIN_BASE = "https://api.jsonbin.io/v3/b";

async function readBin(binId, apiKey) {
  const res = await fetch(`${JSONBIN_BASE}/${binId}/latest`, {
    headers: { "X-Master-Key": apiKey },
  });
  if (!res.ok) throw new Error(`JSONBin read failed: ${res.status}`);
  const data = await res.json();
  return data.record && Array.isArray(data.record.orders) ? data.record.orders : [];
}

async function writeBin(binId, apiKey, orders) {
  const res = await fetch(`${JSONBIN_BASE}/${binId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": apiKey,
    },
    body: JSON.stringify({ orders }),
  });
  if (!res.ok) throw new Error(`JSONBin write failed: ${res.status}`);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { JSONBIN_API_KEY, JSONBIN_ORDERS_BIN_ID } = process.env;
  if (!JSONBIN_API_KEY || !JSONBIN_ORDERS_BIN_ID) {
    return { statusCode: 500, body: "Серверийн тохиргоо дутуу байна (JSONBin)." };
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

  const order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    customerName: customerName || "",
    phone,
    address: address || "",
    pageCount: pages.length,
    pages,
    mediaSnapshot: Array.isArray(mediaSnapshot) ? mediaSnapshot : [],
    status: "pending",
  };

  // Read-modify-write, зэрэгцээ бичилтээс болж мэдээлэл дарагдахаас
  // сэргийлж энгийн 2 удаагийн оролдлоготой хийнэ
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const orders = await readBin(JSONBIN_ORDERS_BIN_ID, JSONBIN_API_KEY);
      orders.unshift(order);
      await writeBin(JSONBIN_ORDERS_BIN_ID, JSONBIN_API_KEY, orders);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, orderId: order.id }),
      };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.error(lastErr);
  return { statusCode: 500, body: "Захиалга хадгалахад алдаа гарлаа." };
};
