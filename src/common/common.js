const AlphabetWordCollection = require('../models/alphabetwordcollections')
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const multer = require('multer');
const Alphabet = require('../models/alphabets')

/**
 * Alphabet List
 * @returns 
 */
const alphabetList = async () => {
  return new Promise(async function (resolve, reject) {
    const alphabetArray = await Alphabet.find({}, {})

    if (alphabetArray.length == 0) {
      reject([])
    }
    var arr = []
    await alphabetArray.forEach((element, index) => {
      const newObj = {
        image_url: `${element.image_url.destination}/${element.image_url.name}`,
        _id: element._id,
        alpha_character: element.alpha_character,
        color_code: element.color_code,
      }
      arr.push(newObj)

      if (alphabetArray.length == index + 1) {
        resolve(arr)
      }
    })
  })
}

/**
 * API Common Response
 * @param {*} res 
 * @param {*} statusCode 
 * @param {*} message 
 * @param {*} data 
 * @returns 
 */
const returnCommonResponse = (res, statusCode, message, data) => {
  return new Promise((resolve, reject) => {
    res.status(statusCode)
    const response = { message, status: statusCode }
    if (data) {
      response.data = data
    }
    resolve(res.json(response))
  })
}

/**
 * Encrypt User Password
 * @param {*} password
 * @returns
 */
const securePassword = async (password) => {
  const passwordHash = await bcryptjs.hash(password, 12);
  return passwordHash;
};

/**
 * Compare Existing Password
 * @param {*} password
 * @param {*} hash
 * @returns
 */
const comparePassword = async (password, hash) => {
  const passwordMatch = await bcryptjs.compare(password, hash);
  return passwordMatch;
};

/**
 * Create New JWT Token
 * @param {*} payload
 * @returns
 */
const createJwtToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });
  return token;
};

/**
 * Verify JWT Token
 * @param {*} token
 * @returns
 */
const verifyJwtToken = async (token) => {
  const payload = await jwt.verify(token, process.env.SECRET_KEY);
  return payload;
};

/**
 * Verify Google Token
 * @param {*} token
 * @returns
 */
const verifyGoogleToken = async (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [process.env.CLIENT_ID1, process.env.CLIENT_ID2],
      });

      const payload = ticket.getPayload();
      resolve(payload);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Storage Path Setup 
 */
const storageFile = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'src/public/uploads/alphabet') // Destination folder for images
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

module.exports = {
  alphabetList,
  returnCommonResponse,
  securePassword,
  comparePassword,
  createJwtToken,
  verifyJwtToken,
  verifyGoogleToken,
  fileFilter,
  storageFile,
}