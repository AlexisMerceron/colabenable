import express from 'express'
import nodemailer from 'nodemailer'

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

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const data = ['x,y,action', '2,4,move', '3,5,move', '1,5,move', '2,4,click']
  const csvContent = data.join('\n')

  await transporter.sendMail({
    from: `"Collabenable" <${MAIL}>`,
    to: "alphanor14200@gmail.com",
    subject: "📊 Nouvelle données 🎉",
    text: "De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV.",
    html: "<b style='font-family: Arial, sans-serif;'>De nouvelles données ont été générées et sont disponibles en pièce jointe au format CSV 🤩.</b>",
    attachments: [
      {
          filename: 'data.csv',
          content: csvContent,
          contentType: 'text/csv'
      }
    ]
  })

  res.send('Hello World! mailersend')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
