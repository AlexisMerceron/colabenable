import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

let transporter;
const app = express();
app.use(express.json({ limit: "10mb" }));

if (process.env.NODE_ENV === "dev") {
  transporter = nodemailer.createTransport({
    host: "0.0.0.0",
    port: 1025,
    direct: true,
  });

  app.use(cors());
} else {
  transporter = nodemailer.createTransport({
    host: "smtp.mailersend.net",
    port: 587,
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.PASSWORD,
    },
  });
  app.use(
    cors({
      origin: "https://lr-tech-collabenable.vercel.app",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"],
    })
  );
}

const port = 3000;

app.post("/send-data", async (req, res) => {
  const { data, fileName, recipient } = req.body;

  if (!data || !Array.isArray(data)) {
    return res
      .status(400)
      .json({ error: "Invalid data format. Expected an array." });
  }

  const csvContent = data.join("\n");

  try {
    await transporter.sendMail({
      from: `"Collabenable" <${process.env.MAIL_FROM}>`,
      to: recipient,
      subject: "📊 Nouvelles données [" + fileName + "] 🎉",
      text: "De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV.",
      html: "<b style='font-family: Arial, sans-serif;'>De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV 🤩.</b>",
      attachments: [
        {
          filename: fileName,
          content: csvContent,
          contentType: "text/csv",
        },
      ],
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occured while sending the email." });
  }

  return res.send("Email sent successfully!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get('/version', async (req, res) => {
  return res.send(process.env.MAIL_FROM + ' : 2.2.2')
})