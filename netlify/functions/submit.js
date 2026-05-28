const https = require('https');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { first_name, email, hormone_profile } = JSON.parse(event.body);
    const contactPayload = JSON.stringify({ email, fields: [{ slug: 'first_name', value: first_name }] });

    const contact = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.systeme.io',
        path: '/api/contacts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '2ot9nwacgb1xj639g3t090uvbtg8tg6ihw2auy48rtxhm932jinc6ysyvendewo0',
          'Content-Length': Buffer.byteLength(contactPayload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(contactPayload);
      req.end();
    });

    const tagPayload = JSON.stringify({ name: hormone_profile });
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.systeme.io',
        path: `/api/contacts/${contact.id}/tags`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '2ot9nwacgb1xj639g3t090uvbtg8tg6ihw2auy48rtxhm932jinc6ysyvendewo0',
          'Content-Length': Buffer.byteLength(tagPayload)
        }
      }, (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      });
      req.on('error', reject);
      req.write(tagPayload);
      req.end();
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
