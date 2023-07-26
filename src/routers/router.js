const express = require('express')
const router = new express.Router()
const cookieParser = require('cookie-parser')
const {
  googleAuthentication,
  getAlphabetData,
  alphabetlist,
  updateAlpabets,
  addAlphabets,
  appleAuthentication,
  adminLogin,
  addAlphabetData,
} = require('../controllers/appController')
const multer = require('multer')
const {
  alphabetCollectioValidation,
  alphabetDataValidation,
} = require('../helpers/validation')

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
// add alphabets in collection
router.post(
  '/alphabets-data',
  upload.any('file'),
  alphabetDataValidation,
  addAlphabetData
)

router.post('/google-login', googleAuthentication)

router.get('/get-alphabets-data', getAlphabetData)
router.post(
  '/add-alphabets',
  upload.any('file'),
  alphabetCollectioValidation,
  addAlphabets
)
router.get('/alphabets-list', alphabetlist)
router.patch('/update-alphabets-data/:id', upload.any('file'), updateAlpabets)
router.post('/apple-login', appleAuthentication)
router.post('/admin-login', adminLogin)

module.exports = router
