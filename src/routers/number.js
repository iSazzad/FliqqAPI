const express = require('express')
const cookieParser = require('cookie-parser')
const adminAuth = require("../middleware/admin-auth");
const auth = require('../middleware/auth');

const numberRouter = new express.Router()
const numberController = require('../controllers/number')
const validation = require('../helpers/validation');
const { uploadFile } = require('../common/upload.service');

numberRouter.use(cookieParser())
numberRouter.post('/add', adminAuth, uploadFile.any('file'), validation.numberCharacter, numberController.addNumberCharacter)

numberRouter.patch('/update/:id', adminAuth, uploadFile.any('file'), numberController.updateNumberCharacter)

numberRouter.get('', auth, numberController.getNumberCharacter)

module.exports = numberRouter