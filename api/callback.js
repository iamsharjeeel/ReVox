import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { code } = req.query;
  try {
    const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', new URLSearchParams({
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.GHL_REDIRECT_URI,
      user_type: 'Location'
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { access_token, refresh_token, locationId, expires_in } = response.data;
    const expires_at = Date.now() + (expires_in * 1000);

    await supabase.from('connections').upsert({ 
      location_id: locationId, access_token, refresh_token, expires_at 
    }, { onConflict: 'location_id' });

    res.redirect(`https://marketflow-dashboard.vibepreview.com/?locationId=${locationId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
