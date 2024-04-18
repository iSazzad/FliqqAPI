const AlphabetWordCollection = require('../models/alphabetwordcollections')

const { alphabetsSvgArray, returnCommonResponse } = require('../common/common')
const { validationResult } = require('express-validator')

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
        body.svg_url = fileData
      })
    }
    console.log('body-->', body)
    const dataExist = await AlphabetWordCollection.findOne({ alpha_character })

    if (!dataExist) {
      const insertValues = await AlphabetWordCollection.create(body)
      return res.status(200).json({
        message: 'data added successfully',
        data: { data: insertValues },
      })
    } else {
      const data = await AlphabetWordCollection.findOneAndUpdate(
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
    console.log("ewzsnkdbk: ", req);
    const alphabetArray = await alphabetsSvgArray()
    if (!Array.isArray(alphabetArray) || alphabetArray.length === 0) {
      return res.status(404).json({
        message: 'data not found',
        data: [],
      })
    }

    const arrList = []
    for (const element of alphabetArray) {
      const dataArr = await AlphabetWordCollection.find({
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

module.exports = {
  addAlphabets,
  alphabetlist,
}
