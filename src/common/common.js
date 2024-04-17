const SvgModel = require('../models/AlphabetCollectionModel')
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

/**
 * 
 * @returns 
 */
const alphabetsSvgArray = async () => {
  return new Promise(async function (resolve, reject) {
    const alphabetArray = await SvgModel.find({}).exec()

    if (alphabetArray.length == 0) {
      reject([])
    }
    var arr = []
    await alphabetArray.forEach((element, index) => {
      const newObj = {
        svg_url: `${element.svg_url.destination}/${element.svg_url.name}`,
        chara_voice_url: `${element.chara_voice_url.destination}/${element.chara_voice_url.name}`,
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

module.exports = {
  alphabetsSvgArray,
  returnCommonResponse,
  securePassword,
  comparePassword,
  createJwtToken,
  verifyJwtToken,
  verifyGoogleToken
}
