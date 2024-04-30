const multer = require('multer')


const storage = multer.diskStorage({});

/**
 * Storage on Local Path Setup 
 */
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

/**
 * find File filter type 
 * @param {*} req 
 * @param {*} file 
 * @param {*} cb 
 */
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

const uploadLocalFolder = multer({ storage: storageFile, fileFilter: fileFilter })
const uploadFile = multer({ storage: storage });

module.exports = {
    uploadFile,
    uploadLocalFolder
}