require('dotenv').config()
const express = require('express')
const router = require('./routers/router')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const Db = process.env.DATABASE
const port = process.env.PORT || 4000
const path = require('path')

mongoose
  .connect(Db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connection successful')
  })
  .catch(error => console.log('Connection error:', error))

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
app.use(router)
app.use(express.urlencoded({ extended: false }))
router.use(cookieParser())
app.use(bodyParser.json())
app.use('/src/public', express.static(path.join(__dirname, 'public')))

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
