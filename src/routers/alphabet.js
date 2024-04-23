const express = require('express')
const cookieParser = require('cookie-parser')
const adminAuth = require("../middleware/admin-auth");
const auth = require('../middleware/auth');

const alphabetRouter = new express.Router()
const alphabetController = require('../controllers/alphabet')
const validation = require('../helpers/validation');
const { uploadFile } = require('../common/upload.service');

alphabetRouter.use(cookieParser())
alphabetRouter.post('/add', adminAuth, uploadFile.any('file'), validation.alphabetCharacter, alphabetController.addAlphabetCharacter)

alphabetRouter.patch('/update/:id', adminAuth, uploadFile.any('file'), alphabetController.updateAlphabetCharacter)

alphabetRouter.get('', auth, alphabetController.getAlphabetCharacter)

module.exports = alphabetRouter