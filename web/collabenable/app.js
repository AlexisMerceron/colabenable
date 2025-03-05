import express from 'express'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "0.0.0.0",
  port: 1025,
  ignoreTLS: true,
})

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
    to: "alphanor14200@gmail.com",
    subject: "Hello ✔",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
  })

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
