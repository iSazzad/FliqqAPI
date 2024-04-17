const express = require('express')
const userRouter = new express.Router()

const {
  socialAuthentication,
  adminLogin,
} = require('../controllers/user')

userRouter.post('/social', socialAuthentication)

userRouter.post('/admin-login', adminLogin)

module.exports = userRouter
