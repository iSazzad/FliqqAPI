require('dotenv').config()
require("./db/connection");

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 8080
const path = require('path');

const userRouter = require('./routers/user')
const alphabetRouter = require('./routers/alphabets');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

app.use(express.json())

app.use("/auth", userRouter)
app.use(alphabetRouter)

app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/src/public', express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
