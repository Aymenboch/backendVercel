import express, { json } from 'express';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import cors from 'cors';
import axios from 'axios'
import dotenv from 'dotenv';

const mailgun = new Mailgun(formData);
const app = express();
dotenv.config();

// Apply CORS middleware to all routes
/*app.use(cors({
    origin: '*', // Allow all origins for testing purposes only
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }));
//app.options('*', cors());*/

app.use(cors());
app.use(json());

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

// Configure the Mailgun provider
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY 
});

app.post('/send-email', (req, res) => {
  const { name, email, msg, tel } = req.body;

  const data = {
    from: '123kennykuavy@gmail.com', // Use your Mailgun domain
    to: '123kennykuavy@gmail.com',
    subject: `Hello from ${name}`,
    text: `Message: ${msg} \nFrom: ${email}\nPhone: ${tel}`
  };

  mg.messages.create(process.env.MAILGUN_DOMAIN, data)
    .then(msg => res.status(200).send("Email sent: " + msg.id))
    .catch(err => {
      console.error('Mailgun error:', err);
      res.status(500).send("Failed to send email");
    });
});

app.post('/mail_sheet', async (req, res) => {
  const email = req.body.Email; // Extract the email from the request body
  if (!email) {
      return res.status(400).json({ error: 'Email is required' });
  }
  try {
      // Send the email to Google Sheets via Sheet.best API
      const response = await axios.post(process.env.SHEET_API , { Email: email });
      // Send a success response back to the frontend
      res.status(200).json({ message: 'Email successfully registered', data: response.data });
  } catch (error) {
      console.error('Error sending email to Google Sheets:', error);
      // Send an error response back to the frontend
      res.status(500).json({ error: 'Failed to register the email' });
  }
});

