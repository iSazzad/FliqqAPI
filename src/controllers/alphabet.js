const Alphabet = require('../models/alphabets')
const { returnCommonResponse, alphabetList } = require('../common/common')
const { validationResult } = require('express-validator')
const { uploadOnCloudinary } = require('../common/cloudinary.service')

/**
 * Add New Alphabets Character with its Color Code
 * @param {*} req 
 * @param {*} res 
 */
const addAlphabetCharacter = async (req, res) => {
  try {
    const body = {
      alpha_character: req.body.alpha_character,
      color_code: req.body.color_code,
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await returnCommonResponse(res, 403, 'Empty data', { errors: errors.array() })
    }

    if (req.files && req.files.length > 0) {
      const item = req.files[0]
      const type = req.body.type ?? null
      const uploadedImage = await uploadOnCloudinary(item.path, type)
      body['image_url'] = {
        path: uploadedImage.url,
        originalName: uploadedImage.original_filename,
        name: uploadedImage.public_id,
        destination: uploadedImage.url,
      }
    }

    const dataExist = await Alphabet.findOne({
      $and: [
        { alpha_character: req.body.alpha_character },
      ],
    })
    if (dataExist) {
      await returnCommonResponse(res, 400, 'This Name Already Exists', {})
    } else {
      const addingAlphabets = new Alphabet(body)
      const insertValues = await addingAlphabets.save()
      await returnCommonResponse(res, 201, 'Data added successfully', { data: insertValues })
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const updateAlphabetCharacter = async (req, res) => {
  try {
    const _id = req.params.id
    let bodyObject

    if (req.body.color_code) {
      bodyObject = { color_code: req.body.color_code }
    }

    if (req.files && req.files.length > 0) {
      const item = req.files[0]

      const type = req.body.type ?? null
      const uploadedImage = await uploadOnCloudinary(item.path, type)

      const url = {
        path: uploadedImage.url,
        originalName: uploadedImage.original_filename,
        name: uploadedImage.public_id,
        destination: uploadedImage.url,
      }

      bodyObject = { ...bodyObject, image_url: url }
    }

    const updatedAlphabet = await Alphabet.findByIdAndUpdate(_id, bodyObject, { new: true })

    if (updatedAlphabet) {
      await returnCommonResponse(res, 200, 'Alphabet updated successfully', updatedAlphabet)
    } else {
      await returnCommonResponse(res, 404, 'Data not found!', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const getAlphabetCharacter = async (req, res) => {
  try {
    const data = await alphabetList()
    if (data.length > 0) {
      await returnCommonResponse(res, 200, 'Data get successfully', { data: data })
    } else {
      await returnCommonResponse(res, 404, 'Data not found', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error ', error)
  }
}

module.exports = {
  addAlphabetCharacter,
  getAlphabetCharacter,
  updateAlphabetCharacter,
}
