// Vercel Serverless Function — Football-Data.org proxy
// CORS সমস্যা এড়াতে server-side থেকে API call করা হচ্ছে

const FD_KEY = "1b40ac75c0494064a532dfeb86d36627";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { league, dateFrom, dateTo } = req.query;

  if (!league || !dateFrom || !dateTo) {
    return res.status(400).json({ error: "league, dateFrom, dateTo প্রয়োজন" });
  }

  const apiUrl = `https://api.football-data.org/v4/competitions/${league}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": FD_KEY,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "API error",
        errorCode: data.errorCode,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
