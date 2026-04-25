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

    const { access_token, locationId } = response.data;
    
    // Redirects to your specific VibePreview link
    res.redirect(`https://marketflow-dashboard.vibepreview.com/?token=${access_token}&locationId=${locationId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
