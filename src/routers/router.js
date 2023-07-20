const express = require('express')
const router = new express.Router()
const cookieParser = require('cookie-parser')
const {
  googleAuthentication,
  addAlphabetData,
  login,
  getAlphabetData,
  svgTable,
  alphabetlist,
} = require('../controllers/appController')
const multer = require('multer')

router.use(cookieParser())

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
const upload = multer({ storage: storageFile })
// add alphabets in collection
router.post('/alphabets', upload.any('file'), addAlphabetData)

router.post('/google-login', googleAuthentication)

router.post('/dashboard-login', login)

router.get('/get-alphabets-data', getAlphabetData)
router.post('/svg-table', upload.any('file'), svgTable)
router.get('/alphabets-list', alphabetlist)

module.exports = router
