const express = require('express')
const userRouter = new express.Router()
const userController = require('../controllers/user')

userRouter.post('/social', userController.socialAuthentication)

userRouter.post('/admin', userController.adminLogin)

module.exports = userRouter
