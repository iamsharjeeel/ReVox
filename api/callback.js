import axios from 'axios';

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

    // Send token back to your Frontend via URL params
    const { access_token, locationId } = response.data;
    res.redirect(`YOUR_AI_STUDIO_URL?token=${access_token}&locationId=${locationId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
