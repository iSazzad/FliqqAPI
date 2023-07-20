const { OAuth2Client } = require('google-auth-library')
const Alphabet = require('../models/alphabets')
const Users = require('../models/users')
const jwt = require('jsonwebtoken')
const SvgModel = require('../models/svgModel')
const alphabetsSvgArray = require('./commonController')
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
        status: true,
        statusCode: 200,
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
      status: true,
      statusCode: 200,
      message: 'user added succesfully',
      data: { data: body },
    })
  } catch (error) {
    console.log('error user--->', error)
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'Error while add data',
      error: error,
    })
  }
}
const addAlphabetData = async (req, res) => {
  try {
    let body = {
      alpha_character: req.body.alpha_character,
      name: req.body.name,
    }
    if (req.files) {
      const fl = req.files
      fl.forEach(element => {
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
    const addingAlphabets = new Alphabet(body)
    const dataExist = await Alphabet.findOne({
      $and: [
        { alpha_character: req.body.alpha_character },
        { name: req.body.name },
      ],
    })
    if (dataExist) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: 'This Name Already Exist',
        data: {},
      })
    }
    const insertValues = await addingAlphabets.save()
    return res.status(201).json({
      status: true,
      statusCode: 201,
      data: { data: insertValues },
      message: 'data added successfully',
    })
  } catch (e) {
    console.log('e-->', e)
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'Error while add data',
      error: e,
    })
  }
}
const login = async (req, res) => {
  try {
    const email = req.body.email
    const userFind = await Users.findOne({
      email: email,
    })
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: 'Invalid password',
      })
    }
    if (userFind === undefined || userFind === null) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Data not found',
      })
    }
    return res.status(200).json({
      status: false,
      statusCode: 200,
      message: 'login successfully',
      error: '',
      data: { data: userFind },
    })
  } catch (e) {
    console.log('e-->', e)
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'invalid login',
      error: e,
    })
  }
}
const getAlphabetData = async (req, res) => {
  try {
    const data = await Alphabet.find({})
    if (data != undefined || data != null) {
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'data get successfully',
        error: '',
        data: { data: data },
      })
    } else {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'data not found',
        error: '',
        data: {},
      })
    }
  } catch (error) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'Error while list data',
      error: e,
    })
  }
}

const svgTable = async (req, res) => {
  try {
    let body = {
      alpha_character: req.body.alpha_character,
      color_code: req.body.color_code,
    }
    if (req.files) {
      const fl = req.files
      fl.forEach(element => {
        if (
          element.mimetype === 'audio/mpeg' ||
          element.mimetype === 'audio/mp4' ||
          element.mimetype === 'audio/x-aiff'
        ) {
          body['chara_voice_url'] = {
            path: element.path,
            originalName: element.originalname,
            name: element.filename,
            destination: element.destination,
          }
        } else {
          body['svg_url'] = {
            path: element.path,
            originalName: element.originalname,
            name: element.filename,
            destination: element.destination,
          }
        }
      })
    }
    const addingSvgData = new SvgModel(body)

    const dataExist = await SvgModel.findOne({
      alpha_character: body.alpha_character,
    })
    console.log('dataExist-->', dataExist)
    if (dataExist === undefined || dataExist === null) {
      const insertValues = await addingSvgData.save()
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'data added succesfully',
        data: { data: insertValues },
      })
    } else {
      let charactor = body.alpha_character
      const data = await SvgModel.updateOne(
        { charactor },
        {
          $set: {
            alpha_character: body.alpha_character,
            color_code: body.color_code,
            chara_voice_url: body.chara_voice_url,
            svg_url: body.svg_url,
          },
        },
        {
          new: true,
        }
      )
      console.log('data-->', data)
    }
    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'data added succesfully',
      data: { data: body },
    })
  } catch (e) {
    console.log('e-->', e)
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'Error while add data',
      error: e,
    })
  }
}

const alphabetlist = async (req, res) => {
  try {
    let alphabetArray = await alphabetsSvgArray()
    var arrList = []
    if (alphabetArray.length === undefined || alphabetArray.length === null) {
      return res.status(404).json({
        status: true,
        statusCode: 404,
        message: 'data not found',
        data: [],
      })
    }
    await alphabetArray.forEach(async (element, index) => {
      var newObj
      await Alphabet.find({ alpha_character: element.alpha_character })
        .then(res => {
          var dataArr = []
          res.forEach(element => {
            var inObj = {
              image_url: `${element.image_url.destination}/${element.image_url.name}`,
              _id: element._id,
              alpha_character: element.alpha_character,
              name: element.name,
              voice_url: `${element.voice_url.destination}/${element.voice_url.name}`,
            }
            dataArr.push(inObj)
          })
          newObj = { ...element, data: res.length > 0 ? dataArr : [] }
          arrList.push(newObj)
        })
        .catch(err => console.log('err-->', err))

      if (alphabetArray.length == index + 1) {
        return res.status(200).json({
          status: true,
          statusCode: 200,
          message: 'data get successfully',
          data: arrList,
        })
      }
    })
  } catch (error) {
    console.log('error-->', error)
  }
}
module.exports = {
  googleAuthentication,
  addAlphabetData,
  login,
  getAlphabetData,
  svgTable,
  alphabetlist,
}
