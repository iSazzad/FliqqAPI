const express = require('express')
const alphabetRouter = new express.Router()
const cookieParser = require('cookie-parser')
const {
    addAlphabetData,
    getAlphabetData,
    alphabetlist,
    updateAlpabets,
    addAlphabets,
} = require('../controllers/alphabet')

const multer = require('multer')
const {
    alphabetCollectioValidation,
    alphabetDataValidation,
} = require('../helpers/validation')

alphabetRouter.use(cookieParser())

const storageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, 'src/public/uploads') // Destination folder for images
        } else if (file.mimetype.startsWith('audio/mpeg')) {
            cb(null, 'src/public/audios') // Destination folder for MP3 files
        } else {
            cb(new Error('Unsupported file type'))
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(
            null,
            file.fieldname +
            '-' +
            uniqueSuffix +
            '.' +
            file.originalname.split('.').pop()
        )
    },
})
const fileFilter = (req, file, cb) => {
    file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/svg+xml' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'audio/mpeg' ||
        file.mimetype === 'audio/mp3'
        ? cb(null, true)
        : cb(null, false)
}
const upload = multer({ storage: storageFile, fileFilter: fileFilter })

alphabetRouter.post('/alphabets-data', upload.any('file'), alphabetDataValidation, addAlphabetData)

alphabetRouter.get('/get-alphabets-data', getAlphabetData)

alphabetRouter.post('/add-alphabets', upload.any('file'), alphabetCollectioValidation, addAlphabets)

alphabetRouter.get('/alphabets-list', alphabetlist)

alphabetRouter.patch('/update-alphabets-data/:id', upload.any('file'), updateAlpabets)

module.exports = alphabetRouter
