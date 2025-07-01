const venom = require('venom-bot');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;
let clientGlobal = null;

app.use(bodyParser.json());

venom
  .create({
    session: process.env.SESSION_NAME || 'session-bot',
    multidevice: true,
    headless: true,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  .then((client) => {
    clientGlobal = client;
    console.log('✅ Bot listo');
  })
  .catch((erro) => {
    console.log('❌ Error al iniciar Venom:', erro);
  });

app.post('/send-message', async (req, res) => {
  const { phone, message } = req.body;

  if (!clientGlobal) {
    return res.status(500).send('Bot no está listo');
  }

  if (!phone || !message) {
    return res.status(400).send('Falta número o mensaje');
  }

  try {
    const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    const result = await clientGlobal.sendText(number, message);
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/healthz', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

