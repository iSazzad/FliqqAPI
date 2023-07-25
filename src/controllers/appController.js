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
        status: true,
        statusCode: 200,
        data: { data: response },
        message: 'Login successfully',
      })
    } else {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: 'Error while google login',
      })
    }
  } catch (error) {
    catchErrorLogs('Error while google login')
    catchErrorLogs(error)
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: 'Error while google login',
    })
  }
}
const addAlphabetData = async (req, res) => {
  try {
    let body = {
      alpha_character: req.body.alpha_character,
      name: req.body.name,
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
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

// const addAlphabets = async (req, res) => {
//   try {
//     let body = {
//       alpha_character: req.body.alpha_character,
//       color_code: req.body.color_code,
//     }
//     if (req.files) {
//       const fl = req.files
//       fl.forEach(element => {
//         if (
//           element.mimetype === 'audio/mpeg' ||
//           element.mimetype === 'audio/mp4' ||
//           element.mimetype === 'audio/x-aiff'
//         ) {
//           body['chara_voice_url'] = {
//             path: element.path,
//             originalName: element.originalname,
//             name: element.filename,
//             destination: element.destination,
//           }
//         } else {
//           body['svg_url'] = {
//             path: element.path,
//             originalName: element.originalname,
//             name: element.filename,
//             destination: element.destination,
//           }
//         }
//       })
//     }
//     const addingSvgData = new SvgModel(body)

//     const dataExist = await SvgModel.findOne({
//       alpha_character: body.alpha_character,
//     })
//     if (dataExist === undefined || dataExist === null) {
//       const insertValues = await addingSvgData.save()
//       return res.status(200).json({
//         status: true,
//         statusCode: 200,
//         message: 'data added succesfully',
//         data: { data: insertValues },
//       })
//     } else {
//       let charactor = body.alpha_character
//       const data = await SvgModel.updateOne(
//         { charactor },
//         {
//           $set: {
//             alpha_character: body.alpha_character,
//             color_code: body.color_code,
//             chara_voice_url: body.chara_voice_url,
//             svg_url: body.svg_url,
//           },
//         },
//         {
//           new: true,
//         }
//       )
//       console.log('data-->', data)
//     }
//     return res.status(200).json({
//       status: true,
//       statusCode: 200,
//       message: 'data added succesfully',
//       data: { data: body },
//     })
//   } catch (e) {
//     console.log('e-->', e)
//     return res.status(400).json({
//       status: false,
//       statusCode: 400,
//       message: 'Error while add data',
//       error: e,
//     })
//   }
// }

// const alphabetlist = async (req, res) => {
//   try {
//     let alphabetArray = await alphabetsSvgArray()
//     var arrList = []
//     if (alphabetArray.length === undefined || alphabetArray.length === null) {
//       return res.status(404).json({
//         status: true,
//         statusCode: 404,
//         message: 'data not found',
//         data: [],
//       })
//     }
//     await alphabetArray.forEach(async (element, index) => {
//       console.log('index 1==>', index)

//       var newObj
//       await Alphabet.find({ alpha_character: element.alpha_character })
//         .then(res => {
//           var dataArr = []
//           res.forEach((element, i) => {
//             var inObj = {
//               image_url: `${element.image_url.destination}/${element.image_url.name}`,
//               _id: element._id,
//               alpha_character: element.alpha_character,
//               name: element.name,
//               voice_url: `${element.voice_url.destination}/${element.voice_url.name}`,
//             }
//             dataArr.push(inObj)
//           })
//           newObj = { ...element, data: res.length > 0 ? dataArr : [] }
//           arrList.push(newObj)
//         })
//         .catch(err => console.log('err-->', err))
//       console.log('index 2==>', index)

//       if (alphabetArray.length == index + 1) {
//         return res.status(200).json({
//           status: true,
//           statusCode: 200,
//           message: 'data get successfully',
//           data: arrList,
//         })
//       }
//     })
//   } catch (error) {
//     console.log('error-->', error)
//   }
// }

const addAlphabets = async (req, res) => {
  try {
    const { alpha_character, color_code } = req.body
    const body = { alpha_character, color_code }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
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

    const dataExist = await AlphabetCollectionModel.findOne({ alpha_character })

    if (!dataExist) {
      const insertValues = await AlphabetCollectionModel.create(body)
      return res.status(200).json({
        status: true,
        statusCode: 200,
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
      status: true,
      statusCode: 200,
      message: 'data added successfully',
      data: { data: body },
    })
  } catch (e) {
    console.error('e-->', e)

    // Determine the appropriate status code based on the error type
    const statusCode = e instanceof ClientError ? 400 : 500

    return res.status(statusCode).json({
      status: false,
      statusCode,
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
        status: true,
        statusCode: 404,
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
      status: true,
      statusCode: 200,
      message: 'data get successfully',
      data: arrList,
    })
  } catch (error) {
    console.error('error-->', error)
    return res.status(500).json({
      status: false,
      statusCode: 500,
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
      status: true,
      statusCode: 200,
      message: 'data update successfully',
      data: updatedUser,
    })
  } catch (error) {
    console.error('error==>', error)
    return res.status(500).json({
      status: false,
      statusCode: 500,
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
}
