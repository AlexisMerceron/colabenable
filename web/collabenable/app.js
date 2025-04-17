import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

let transporter;
const app = express();
app.use(express.json({ limit: '10mb' }));

if (process.env.NODE_ENV === 'dev') {
  transporter = nodemailer.createTransport({
    host: '0.0.0.0',
    port: 1025,
    direct: true,
  });

  app.use(cors());
} else {
  transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.PASSWORD,
    },
  });
  app.use(
    cors({
      origin: 'https://lr-tech-collabenable.vercel.app',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type'],
    })
  );
}

const port = 3000;

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.CLIENT_ID);
  params.append('client_secret', process.env.CLIENT_SECRET);
  params.append('scope', 'https://graph.microsoft.com/.default');

  const response = await axios.post(
    'https://login.microsoftonline.com/' +
      process.env.TENANT_ID +
      '/oauth2/v2.0/token',
    params
  );

  return response.data.access_token;
}

app.post('/send-data', async (req, res) => {
  const { data, fileName, recipient } = req.body;

  if (!data || !Array.isArray(data)) {
    return res
      .status(400)
      .json({ error: 'Invalid data format. Expected an array.' });
  }

  const csvContent = data.join('\n');

  try {
    await transporter.sendMail({
      from: `"Collabenable" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO,
      cc: recipient,
      subject: '📊 Nouvelles données [' + fileName + '] 🎉',
      text: 'De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV.',
      html: "<b style='font-family: Arial, sans-serif;'>De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV 🤩.</b>",
      attachments: [
        {
          filename: fileName,
          content: csvContent,
          contentType: 'text/csv',
        },
      ],
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: 'An error occured while sending the email.' });
  }

  try {
    const filepath = path.join(path.resolve(), fileName || 'default.csv');
    // Écrire le fichier CSV localement
    fs.writeFileSync(filepath, csvContent);

    // Récupérer un token d'accès Graph
    const accessToken = await getAccessToken();

    // Lire le fichier pour l'uploader
    const fileData = fs.readFileSync(filepath);

    // Upload vers SharePoint
    const response = await axios.put(
      `https://graph.microsoft.com/v1.0/sites/${process.env.SITE_ID}/drive/root:/${fileName}:/content`,
      fileData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/csv',
        },
      }
    );

    // Supprimer le fichier local après l'upload
    fs.unlinkSync(filepath);

    //res.json({ success: true, fileUrl: response.data.webUrl });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: 'An error occured while sending to sharepoint.' });
  }

  return res.send('File sent successfully!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get('/version', async (req, res) => {
  return res.send(process.env.MAIL_FROM + ' : 2.2.2');
});
