const { OAuth2Client, JWT } = require('google-auth-library')
const Alphabet = require('../models/alphabets')
const Users = require('../models/users')
const jwt = require('jsonwebtoken')
const AlphabetCollectionModel = require('../models/AlphabetCollectionModel')
const alphabetsSvgArray = require('./commonController')
const appleSignin = require('apple-signin-auth')
const { validationResult } = require('express-validator')
const users = []
const client = new OAuth2Client([
  '151836319995-ec3t6nq6hm1rjkq1v6c9b4vn6uurl6sf.apps.googleusercontent.com',
])
function upsert(array, item) {
  const i = array.findIndex(_item => _item.email === item.email)
  if (i > -1) array[i] = item
  else array.push(item)
}
const googleAuthentication = async (req, res) => {
  try {
    const { idToken } = req.body
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      requiredAudience: [
        '151836319995-ec3t6nq6hm1rjkq1v6c9b4vn6uurl6sf.apps.googleusercontent.com',
      ],
    })
    const { name, email, picture, given_name, family_name } =
      await ticket.getPayload()

    let body = {
      first_name: given_name,
      last_name: family_name,
      email: email,
      profile_url: picture,
      id_token: idToken,
    }
    const token = jwt.sign({ data: email }, process.env.SECRET_KEY, {
      expiresIn: '30d',
    })
    body['token'] = token
    const addDbObj = new Users(body)
    upsert(users, { name, email, picture, given_name, family_name })
    const dataExist = await Users.findOne({
      $and: [
        { first_name: given_name },
        { last_name: family_name },
        { email: email },
        { profile_url: picture },
      ],
    })
    if (dataExist === undefined || dataExist === null) {
      const addDb = await addDbObj.save()
      return res.status(200).json({
        message: 'user added succesfully',
        data: { data: addDb },
      })
    } else {
      await Users.updateOne(
        { email },
        {
          $set: {
            first_name: given_name,
            last_name: family_name,
            email: email,
            profile_url: picture,
          },
        },
        {
          new: true,
        }
      )
    }
    return res.status(200).json({
      message: 'user added succesfully',
      data: { data: body },
    })
  } catch (error) {
    console.log('error user--->', error)
    return res.status(400).json({
      message: 'Error while add data',
      error: error,
    })
  }
}
const appleAuthentication = async (req, res) => {
  try {
    const data = await appleSignin.verifyIdToken(req.body.idToken, {
      audience: '',
      ignoreExpiration: true,
    })
    if (data && data.email) {
      // Prepare object to get user details
      const conditions = {
        isDeleted: false,
        email: `${data.email}`,
        userType: 'apple',
      }
      // Get user detail
      let user = await Users.findOne(
        conditions,
        'firstName lastName email profileImageUrl userType'
      )
      if (user === undefined || user === null) {
        user = await db.models.users.create({
          userType: 'apple',
          email: data.email,
        })
      }
      const token = JWT.sign(
        {
          data: {
            _id: user._id,
            userType: user.userType,
            email: user.email,
          },
        },
        config.secretTokenKey
      )
      const response = {
        token: token,
        _id: user._id,
        email: user.email,
      }
      res.status(200).json({
        data: { data: response },
        message: 'Login successfully',
      })
    } else {
      return res.status(400).json({
        message: 'Error while google login',
      })
    }
  } catch (error) {
    catchErrorLogs('Error while google login')
    catchErrorLogs(error)
    return res.status(400).json({
      message: 'Error while google login',
    })
  }
}

const addAlphabetData = async (req, res) => {
  try {
    console.log('addAlphabetData req-->', req.body)
    const body = {
      alpha_character: req.body.alpha_character,
      name: req.body.name,
    }
    // Validate the request using validationResult
    const errors = validationResult(req)
    console.log('errors-->', errors)
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() })
    }

    if (req.files && req.files.length > 0) {
      // Assuming that req.files is an array of files
      req.files.forEach(element => {
        if (
          element.mimetype === 'audio/mpeg' ||
          element.mimetype === 'audio/mp4' ||
          element.mimetype === 'audio/x-aiff'
        ) {
          body['voice_url'] = {
            path: element.path,
            originalName: element.originalname,
            name: element.filename,
            destination: element.destination,
          }
        } else {
          body['image_url'] = {
            path: element.path,
            originalName: element.originalname,
            name: element.filename,
            destination: element.destination,
          }
        }
      })
    }

    const dataExist = await Alphabet.findOne({
      $and: [
        { alpha_character: req.body.alpha_character },
        { name: req.body.name },
      ],
    })
    console.log('dataExist-->', dataExist, body)
    if (dataExist) {
      return res.status(400).json({
        message: 'This Name Already Exists',
        data: {},
      })
    }

    const addingAlphabets = new Alphabet(body)
    const insertValues = await addingAlphabets.save()
    console.log('add alphabets data-->', insertValues)
    return res.status(201).json({
      message: 'Data added successfully',
      data: { data: insertValues },
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      message: 'Error while adding data',
      error: error.message,
    })
  }
}
const addAlphabetDetails = async (req, res) => {
  console.log('addAlphabetDetails')
  try {
    console.log('addAlphabetData req-->', req.body)
    const body = {
      alpha_character: req.body.alpha_character,
      name: req.body.name,
    }
    // Validate the request using validationResult
    const errors = validationResult(req)
    console.log('errors-->', errors)
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() })
    }

    if (req.files && req.files.length > 0) {
      // Assuming that req.files is an array of files
      req.files.forEach(element => {
        if (
          element.mimetype === 'audio/mpeg' ||
          element.mimetype === 'audio/mp4' ||
          element.mimetype === 'audio/x-aiff'
        ) {
          body['voice_url'] = {
            path: element.path,
            originalName: element.originalname,
            name: element.filename,
            destination: element.destination,
          }
        } else {
          body['image_url'] = {
            path: element.path,
            originalName: element.originalname,
            name: element.filename,
            destination: element.destination,
          }
        }
      })
    }

    const dataExist = await Alphabet.findOne({
      $and: [
        { alpha_character: req.body.alpha_character },
        { name: req.body.name },
      ],
    })
    console.log('dataExist-->', dataExist, body)
    if (dataExist) {
      return res.status(400).json({
        message: 'This Name Already Exists',
        data: {},
      })
    }

    const addingAlphabets = new Alphabet(body)
    const insertValues = await addingAlphabets.save()
    console.log('add alphabets data-->', insertValues)
    return res.status(201).json({
      message: 'Data added successfully',
      data: { data: insertValues },
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      message: 'Error while adding data',
      error: error.message,
    })
  }
}
const login = async (req, res) => {
  try {
    const email = req.body.email
    console.log('req login--->', req.body, process.env.ADMIN_PASSWORD)
    const userFind = await Users.findOne({
      email: email,
    })
    console.log('userFind login--->', userFind)

    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({
        message: 'Invalid password',
      })
    }
    if (userFind === undefined || userFind === null) {
      return res.status(404).json({
        message: 'Data not found',
      })
    }
    return res.status(200).json({
      message: 'login successfully',
      data: { data: userFind },
    })
  } catch (e) {
    console.log('e-->', e)
    return res.status(400).json({
      message: 'invalid login',
      error: e,
    })
  }
}
const loginUser = async (req, res) => {
  console.log('loginUser')
  try {
    const email = req.body.email
    console.log('req login--->', req.body, process.env.ADMIN_PASSWORD)
    const userFind = await Users.findOne({
      email: email,
    })
    console.log('userFind login--->', userFind)

    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({
        message: 'Invalid password',
      })
    }
    if (userFind === undefined || userFind === null) {
      return res.status(404).json({
        message: 'Data not found',
      })
    }
    return res.status(200).json({
      message: 'login successfully',
      data: { data: userFind },
    })
  } catch (e) {
    console.log('e-->', e)
    return res.status(400).json({
      message: 'invalid login',
      error: e,
    })
  }
}
const getAlphabetData = async (req, res) => {
  try {
    const data = await Alphabet.find({})
    console.log('getAlphabetData', data.length)
    if (data.length > 0) {
      return res.status(200).json({
        message: 'Data retrieved successfully',
        data: { data: data },
      })
    } else {
      return res.status(404).json({
        message: 'Data not found',
        data: [],
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error while fetching data',
      error: error.message,
    })
  }
}

const addAlphabets = async (req, res) => {
  try {
    const { alpha_character, color_code } = req.body
    const body = { alpha_character, color_code }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() })
    }
    if (req.files) {
      req.files.forEach(element => {
        const { mimetype, path, originalname, filename, destination } = element
        const fileData = {
          path,
          originalName: originalname,
          name: filename,
          destination,
        }

        if (
          mimetype === 'audio/mpeg' ||
          mimetype === 'audio/mp4' ||
          mimetype === 'audio/x-aiff'
        ) {
          body.chara_voice_url = fileData
        } else {
          body.svg_url = fileData
        }
      })
    }
    console.log('body-->', body)
    const dataExist = await AlphabetCollectionModel.findOne({ alpha_character })

    if (!dataExist) {
      const insertValues = await AlphabetCollectionModel.create(body)
      return res.status(200).json({
        message: 'data added successfully',
        data: { data: insertValues },
      })
    } else {
      const data = await AlphabetCollectionModel.findOneAndUpdate(
        { alpha_character },
        body,
        {
          new: true,
        }
      )
      console.log('data-->', data)
    }

    return res.status(200).json({
      message: 'data added successfully',
      data: { data: body },
    })
  } catch (e) {
    console.error('e-->', e)

    // Determine the appropriate status code based on the error type
    const statusCode = e instanceof ClientError ? 400 : 500

    return res.status(statusCode).json({
      message: `Error while adding data: ${
        e instanceof ClientError ? 'Bad Request' : 'Internal Server Error'
      }`,
      error: e.message,
    })
  }
}

const alphabetlist = async (req, res) => {
  try {
    const alphabetArray = await alphabetsSvgArray()
    if (!Array.isArray(alphabetArray) || alphabetArray.length === 0) {
      return res.status(404).json({
        message: 'data not found',
        data: [],
      })
    }

    const arrList = []
    for (const element of alphabetArray) {
      const dataArr = await Alphabet.find({
        alpha_character: element.alpha_character,
      })
      const newDataArr = dataArr.map(element => ({
        image_url: `${element.image_url.destination}/${element.image_url.name}`,
        _id: element._id,
        alpha_character: element.alpha_character,
        name: element.name,
        voice_url: `${element.voice_url.destination}/${element.voice_url.name}`,
      }))
      arrList.push({ ...element, data: newDataArr })
    }

    return res.status(200).json({
      message: 'data get successfully',
      data: { data: arrList },
    })
  } catch (error) {
    console.error('error-->', error)
    return res.status(500).json({
      message: 'An error occurred',
      data: [],
    })
  }
}

const updateAlpabets = async (req, res) => {
  try {
    const _id = req.params.id
    const { name } = req.body
    let voice_url, image_url

    if (req.files) {
      req.files.forEach(element => {
        const { mimetype, path, originalname, filename, destination } = element
        const fileData = {
          path,
          originalName: originalname,
          name: filename,
          destination,
        }

        if (
          mimetype === 'audio/mpeg' ||
          mimetype === 'audio/mp4' ||
          mimetype === 'audio/x-aiff'
        ) {
          voice_url = fileData
        } else {
          image_url = fileData
        }
      })
    }

    const updatedUser = await Alphabet.findByIdAndUpdate(
      _id,
      { name, voice_url, image_url },
      { new: true } // Return the updated user
    )

    return res.status(200).json({
      message: 'data update successfully',
      data: updatedUser,
    })
  } catch (error) {
    console.error('error==>', error)
    return res.status(500).json({
      message: 'An error occurred',
      data: null,
    })
  }
}

module.exports = {
  googleAuthentication,
  addAlphabetData,
  login,
  getAlphabetData,
  addAlphabets,
  alphabetlist,
  updateAlpabets,
  appleAuthentication,
  loginUser,
  addAlphabetDetails,
}
