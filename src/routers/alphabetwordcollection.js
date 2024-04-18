const express = require('express')
const cookieParser = require('cookie-parser')
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin-auth");
const multer = require('multer')
const alphabetWordCollectionRouter = new express.Router()
const alphabetWordController = require('../controllers/alphabetwordcollection')
const validation = require('../helpers/validation');
const { storageFile, fileFilter } = require('../common/common');

const upload = multer({ storage: storageFile, fileFilter: fileFilter })

alphabetWordCollectionRouter.use(cookieParser())

alphabetWordCollectionRouter.post('/add-list', upload.any('file'), validation.alphabetCollection, alphabetWordController.addAlphabets)

alphabetWordCollectionRouter.get('/list', auth, alphabetWordController.alphabetlist)

module.exports = alphabetWordCollectionRouter
