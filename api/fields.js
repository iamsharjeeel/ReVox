import axios from 'axios';

export default async function handler(req, res) {
  const { token, locationId } = req.query;
  try {
    const response = await axios.get(`https://services.leadconnectorhq.com/locations/${locationId}/customFields`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });
    // HighLevel returns { customFields: [...] }
    res.status(200).json(response.data.customFields || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
