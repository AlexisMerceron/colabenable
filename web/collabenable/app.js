import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'

const MAIL = 'MS_M6lMTb@trial-pr9084z0n38lw63d.mlsender.net'
const PASSWORD = 'mssp.PhWti8z.0r83ql3jy1vgzw1j.1QYCcCi'

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  auth: {
    user: MAIL,
    pass: PASSWORD
  }
})

// const transporter = nodemailer.createTransport({
//   host: "0.0.0.0",
//   port: 1025,
// })

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(cors({
  origin: 'https://datacollect-beta.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}))

const port = 3000

app.post('/send-data', async (req, res) => {
  const { data, fileName } = req.body

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
  }

  const csvContent = data.join('\n')

  await transporter.sendMail({
    from: `"Collabenable" <${MAIL}>`,
    to: "pralphanor@lrtechnologies.fr",
    subject: "📊 Nouvelle données [" + fileName + "] 🎉",
    text: "De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV.",
    html: "<b style='font-family: Arial, sans-serif;'>De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV 🤩.</b>",
    attachments: [
      {
          filename: fileName,
          content: csvContent,
          contentType: 'text/csv'
      }
    ]
  })

  res.send('Hello World! true mail')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/version', async (req, res) => {
  res.send('2.1.1')
})