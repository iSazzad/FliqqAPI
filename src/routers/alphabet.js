const express = require('express')
const cookieParser = require('cookie-parser')
const adminAuth = require("../middleware/admin-auth");
const multer = require('multer')
const alphabetRouter = new express.Router()
const alphabetController = require('../controllers/alphabet')
const validation = require('../helpers/validation');
const { storageFile, fileFilter } = require('../common/common');
const auth = require('../middleware/auth');

const upload = multer({ storage: storageFile, fileFilter: fileFilter })

alphabetRouter.use(cookieParser())

alphabetRouter.post('/add', adminAuth, upload.any('file'), validation.alphabetCharacter, alphabetController.addAlphabetCharacter)

alphabetRouter.patch('/update/:id', adminAuth, upload.any('file'), alphabetController.updateAlphabetCharacter)

alphabetRouter.get('', auth, alphabetController.getAlphabetCharacter)

module.exports = alphabetRouter