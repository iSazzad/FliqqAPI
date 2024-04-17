const Alphabet = require('../models/alphabets')
const AlphabetCollectionModel = require('../models/AlphabetCollectionModel')
const { alphabetsSvgArray, returnCommonResponse } = require('../common/common')
const { validationResult } = require('express-validator')

const addAlphabetData = async (req, res) => {
  console.log('addAlphabetData req-->', req.body)
  try {
    const body = {
      alpha_character: req.body.alpha_character,
      name: req.body.name,
    }
    const errors = validationResult(req)
    console.log('errors-->', errors)
    if (!errors.isEmpty()) {
      await returnCommonResponse(res, 403, 'Empty data', { errors: errors.array() })
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
      await returnCommonResponse(res, 400, 'This Name Already Exists', {})
    }

    const addingAlphabets = new Alphabet(body)
    const insertValues = await addingAlphabets.save()
    await returnCommonResponse(res, 201, 'Data added successfully', { data: insertValues })
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const getAlphabetData = async (req, res) => {
  try {
    const data = await Alphabet.find({})
    console.log('getAlphabetData', data.length)
    if (data.length > 0) {
      await returnCommonResponse(res, 200, 'Data get successfully', { data: data })
    } else {
      await returnCommonResponse(res, 404, 'Data not found', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error ', error)
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
      message: `Error while adding data: ${e instanceof ClientError ? 'Bad Request' : 'Internal Server Error'
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
    await returnCommonResponse(res, 200, 'data get successfully', arrList)
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
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
    await returnCommonResponse(res, 200, 'data get successfully', updatedUser)
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}


module.exports = {
  addAlphabetData,
  getAlphabetData,
  addAlphabets,
  alphabetlist,
  updateAlpabets,
}
