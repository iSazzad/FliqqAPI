const express = require('express')
const cookieParser = require('cookie-parser')
const adminAuth = require("../middleware/admin-auth");
const auth = require('../middleware/auth');

const allTypeWordRouter = new express.Router()
const allTypeWordController = require('../controllers/alltypeword')
const validation = require('../helpers/validation');
const { uploadFile } = require('../common/upload.service');

allTypeWordRouter.use(cookieParser())
allTypeWordRouter.post('/add', adminAuth, uploadFile.any('file'), validation.allTypeWord, allTypeWordController.addAllTypeWordImage)

allTypeWordRouter.patch('/update/:id', adminAuth, uploadFile.any('file'), allTypeWordController.updateAllTypeWordImage)

allTypeWordRouter.get('/:type', auth, allTypeWordController.getAllTypeWordImage)

module.exports = allTypeWordRouter