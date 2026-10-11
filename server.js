const express = require('express');
const path = require('path');
const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

// 代理 OpenAI
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured' });
  }

  const { model, messages, temperature, max_tokens } = req.body || {};

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages || [],
        temperature: temperature ?? 0.9,
        max_tokens: max_tokens ?? 200
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server listening on ' + port));
