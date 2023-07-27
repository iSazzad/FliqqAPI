const { OAuth2Client, JWT } = require('google-auth-library')
const AlphabetData = require('../models/alphabetsData')
const Users = require('../models/users')
const jwt = require('jsonwebtoken')
const AlphabetCollectionModel = require('../models/AlphabetCollectionModel')
const { alphabetsSvgArray, statusMessage } = require('./commonController')
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
      statusMessage(res, 200, 'user added succesfully', addDb, null)
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
    statusMessage(res, 200, 'user added succesfully', body, null)
  } catch (error) {
    statusMessage(res, 500, 'An error occurred', null, error.message)
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

const getAlphabetData = async (req, res) => {
  try {
    const data = await AlphabetData.find({}).exec()
    if (data.length > 0) {
      statusMessage(res, 200, 'Data retrieved successfully', data, null)
    } else {
      statusMessage(res, 404, 'Data not found', [], null)
    }
  } catch (error) {
    statusMessage(res, 500, 'Error while fetching data', null, error.message)
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
    if (req.files && req.files.length > 0) {
      req.files.forEach(element => {
        const { path, originalname, filename, destination } = element
        const fileData = {
          path,
          originalName: originalname,
          name: filename,
          destination,
        }
        body.svg_url = fileData
      })
    }
    const dataExist = await AlphabetCollectionModel.findOne({
      alpha_character,
    })

    if (!dataExist) {
      const insertValues = await AlphabetCollectionModel.create(body)
      statusMessage(res, 200, 'data added successfully', insertValues, null)
    } else {
      const data = await AlphabetCollectionModel.findOneAndUpdate(
        { alpha_character },
        body,
        {
          new: true,
        }
      )
    }
    statusMessage(res, 200, 'data added successfully', body, null)
  } catch (error) {
    statusMessage(res, 500, 'Error while adding data', null, error.message)
  }
}

const alphabetlist = async (req, res) => {
  try {
    const alphabetArray = await alphabetsSvgArray()
    if (!Array.isArray(alphabetArray) || alphabetArray.length === 0) {
      statusMessage(res, 404, 'data not found', [], null)
    }

    const arrList = []
    for (const element of alphabetArray) {
      const dataArr = await AlphabetData.find({
        alpha_character: element.alpha_character,
      })
      const newDataArr = dataArr.map(element => ({
        image_url: `${element.image_url.destination}/${element.image_url.name}`,
        _id: element._id,
        alpha_character: element.alpha_character,
        name: element.name,
      }))
      arrList.push({ ...element, data: newDataArr })
    }
    await statusMessage(res, 200, 'data get successfully', arrList)
  } catch (error) {
    console.error('error-->', error)
    await statusMessage(res, 500, 'Error while fetching data', [])
  }
}

const deleteAlpabetsData = async (req, res) => {
  try {
    const id = req.params.id
    const deletedAlphabetData = await AlphabetData.findByIdAndDelete(id)

    if (!deletedAlphabetData) {
      statusMessage(res, 404, 'Data not found for the given ID.', null, null)
    } else {
      statusMessage(
        res,
        200,
        'Data deleted successfully',
        deletedAlphabetData,
        null
      )
    }
  } catch (error) {
    statusMessage(res, 500, 'An error occurred', null, error.message)
  }
}

const updateAlpabets = async (req, res) => {
  try {
    const _id = req.params.id
    const { name } = req.body
    let image_url
    if (req.files && req.files.length > 0) {
      // Assuming that req.files is an array of files
      req.files.forEach(element => {
        body['image_url'] = {
          path: element.path,
          originalName: element.originalname,
          name: element.filename,
          destination: element.destination,
        }
      })
    }

    const updatedUser = await AlphabetData.findByIdAndUpdate(
      _id,
      { name, image_url },
      { new: true } // Return the updated user
    )
    statusMessage(res, 200, 'data update successfully', updatedUser, null)
  } catch (error) {
    statusMessage(res, 500, 'An error occurred', null, error.message)
  }
}
const addAlphabetData = async (req, res) => {
  try {
    const body = {
      alpha_character: req.body.alpha_character,
      name: req.body.name,
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() })
    }

    if (req.files && req.files.length > 0) {
      // Assuming that req.files is an array of files
      req.files.forEach(element => {
        body['image_url'] = {
          path: element.path,
          originalName: element.originalname,
          name: element.filename,
          destination: element.destination,
        }
      })
    }

    const dataExist = await AlphabetData.findOne({
      $and: [
        { alpha_character: req.body.alpha_character },
        { name: req.body.name },
      ],
    })
    if (dataExist) {
      statusMessage(res, 400, 'This Name Already Exists', {}, null)
    }

    const addingAlphabets = new AlphabetData(body)
    const insertValues = await addingAlphabets.save()
    console.log('add alphabets data-->', insertValues)
    statusMessage(res, 201, 'Data added successfully', insertValues, null)
  } catch (error) {
    statusMessage(res, 500, 'Error while adding data', null, error.message)
  }
}
const adminLogin = async (req, res) => {
  try {
    const email = req.body.email
    const adminFind = await Users.findOne({
      email: email,
    }).exec()
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      statusMessage(res, 400, 'Invalid password', null, null)
    }
    if (adminFind === undefined || adminFind === null) {
      statusMessage(res, 404, 'admin not register', null, null)
    }
    statusMessage(res, 200, 'login successfully', adminFind, null)
  } catch (error) {
    statusMessage(res, 500, 'invalid login', null, error.message)
  }
}
module.exports = {
  googleAuthentication,
  getAlphabetData,
  addAlphabets,
  alphabetlist,
  updateAlpabets,
  appleAuthentication,
  addAlphabetData,
  adminLogin,
  deleteAlpabetsData,
}
