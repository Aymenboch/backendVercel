import express, { json } from 'express';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import ServerlessHttp from 'serverless-http';

dotenv.config();

const mailgun = new Mailgun(formData);
const app = express();

// Apply CORS middleware to all routes
app.use(cors());
app.use(json());

// Configure the Mailgun provider
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

app.post('/send-email', (req, res) => {
  const { name, email, msg, tel } = req.body;

  const data = {
    from: '123kennykuavy@gmail.com', // Use your Mailgun domain
    to: '123kennykuavy@gmail.com',
    subject: `Hello from ${name}`,
    text: `Message: ${msg} \nFrom: ${email}\nPhone: ${tel}`,
  };

  mg.messages.create(process.env.MAILGUN_DOMAIN, data)
    .then(msg => res.status(200).send("Email sent: " + msg.id))
    .catch(err => {
      console.error('Mailgun error:', err);
      res.status(500).send("Failed to send email");
    });
});

app.post('/mail_sheet', async (req, res) => {
  const email = req.body.Email;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const response = await axios.post(process.env.SHEET_API, { Email: email });
    res.status(200).json({ message: 'Email successfully registered', data: response.data });
  } catch (error) {
    console.error('Error sending email to Google Sheets:', error);
    res.status(500).json({ error: 'Failed to register the email' });
  }
});

app.get('/test', (req, res) => {
  return res.json({ message: "success !!" });
});

// Wrap the Express app with serverless-http and export as the default export
export default ServerlessHttp(app);
