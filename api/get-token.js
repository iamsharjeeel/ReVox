import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { locationId } = req.query;

  if (!locationId) return res.status(400).json({ error: 'Location ID required' });

  try {
    // 1. Fetch connection from Supabase
    const { data: connection, error } = await supabase
      .from('connections')
      .select('*')
      .eq('location_id', locationId)
      .single();

    if (error || !connection) return res.status(404).json({ error: 'No connection found' });

    // 2. Check if token is expired (or expires in the next 5 minutes)
    const isExpired = (Date.now() + 300000) > connection.expires_at;

    if (isExpired) {
      // 3. Auto-Refresh the token
      const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: connection.refresh_token,
        user_type: 'Location'
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

      const { access_token, refresh_token, expires_in } = response.data;
      const expires_at = Date.now() + (expires_in * 1000);

      // 4. Update Supabase with new tokens
      await supabase
        .from('connections')
        .update({ access_token, refresh_token, expires_at })
        .eq('location_id', locationId);

      return res.status(200).json({ token: access_token });
    }

    // 5. Return existing valid token
    res.status(200).json({ token: connection.access_token });

  } catch (error) {
    console.error('Auth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to retrieve or refresh token' });
  }
}
