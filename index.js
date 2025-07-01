const venom = require('venom-bot');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000; // Este es el puerto que vas a usar en tu webhook

let clientGlobal = null;

app.use(bodyParser.json());

venom
  .create({
    session: process.env.SESSION_NAME || 'session-bot',
    multidevice: true,
     //browserArgs: ['--no-sandbox'],
    //executablePath: 'C:\\Program Files\\chrome-win\\chrome.exe',
     headless: false, // para ver el navegador
  })
  .then((client) => {
    clientGlobal = client;
    console.log('✅ Bot listo');
  })
  .catch((erro) => {
    console.log('❌ Error al iniciar Venom:', erro);
  });

// Ruta webhook para enviar mensajes
app.post('/send-message', async (req, res) => {
  console.log('📩 Webhook recibido');
  console.log('🔢 Datos recibidos:', req.body);

  const { phone, message } = req.body;

  if (!clientGlobal) {
    console.log('⚠️ Bot no está listo aún');
    return res.status(500).send('Bot no está listo');
  }

  if (!phone || !message) {
    console.log('⚠️ Faltan datos: phone o message');
    return res.status(400).send('Falta número o mensaje');
  }

  try {
    const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    const result = await clientGlobal.sendText(number, message);
    console.log('📤 Mensaje enviado:', message);
    res.send(result);
  } catch (err) {
    console.error('❌ Error al enviar mensaje:', err);
    res.status(500).send(err);
  }
});

app.get('/healthz', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});
