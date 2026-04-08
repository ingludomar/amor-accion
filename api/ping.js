// Serverless function que hace ping a Supabase para evitar que se pause por inactividad.
// Se ejecuta cada 5 días via Vercel Cron.
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: 'Missing Supabase config' });
  }

  try {
    const response = await fetch(`${url}/rest/v1/campuses?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    const status = response.status;
    return res.status(200).json({ ok: true, supabase: status, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
