// netlify/functions/order-list.js
const { getDb } = require("./_shared/firebase");

exports.handler = async (event) => {
  const { ADMIN_PIN } = process.env;
  const pin = event.queryStringParameters && event.queryStringParameters.pin;

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return { statusCode: 401, body: JSON.stringify({ error: "PIN буруу байна." }) };
  }

  try {
    const db = getDb();
    const snap = await db.collection("orders").orderBy("createdAt", "desc").get();
    const orders = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        createdAt: d.createdAt,
        customerName: d.customerName,
        phone: d.phone,
        address: d.address,
        pageCount: d.pageCount,
        status: d.status,
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: `Захиалга татахад алдаа гарлаа: ${err.message}` };
  }
};
