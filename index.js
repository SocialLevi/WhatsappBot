const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'client-one', dataPath: './' }),
});

client.on('qr', (qr) => {
  console.log('Scan the QR code below:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
  if (message.body.startsWith('.rada')) {
    const query = message.body.slice(5).trim();
    if (!query) {
      message.reply('Please ask a question after .rada');
      return;
    }
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: query }],
      });

      const reply = response.data.choices[0].message.content;
      message.reply(reply);
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      message.reply('Sorry, I could not process your request.');
    }
  }
});

// Start the client
client.initialize();
