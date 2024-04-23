const express = require('express')
const cookieParser = require('cookie-parser')
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin-auth");

const alphabetWordCollectionRouter = new express.Router()
const alphabetWordController = require('../controllers/alphabetwordcollection')
const validation = require('../helpers/validation');
const { uploadFile } = require('../common/upload.service');

alphabetWordCollectionRouter.use(cookieParser())

alphabetWordCollectionRouter.post('/add', adminAuth, uploadFile.any('file'), validation.alphabetCollection, alphabetWordController.addAlphabetWord)

alphabetWordCollectionRouter.patch('/update/:id', adminAuth, uploadFile.any('file'), alphabetWordController.updateAlphabetWord)

alphabetWordCollectionRouter.get('', auth, alphabetWordController.alphabetlist)

module.exports = alphabetWordCollectionRouter
