const Number = require('../models/numbers')
const { returnCommonResponse, numbersList } = require('../common/common')
const { validationResult } = require('express-validator')
const { uploadOnCloudinary } = require('../common/cloudinary.service')

/**
 * Add New Numbers Character with its Color Code
 * @param {*} req 
 * @param {*} res 
 */
const addNumberCharacter = async (req, res) => {
  try {
    const body = {
      number_character: req.body.number_character,
      color_code: req.body.color_code,
      name: req.body.name,
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await returnCommonResponse(res, 403, 'Empty data', { errors: errors.array() })
    } else {
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

      const dataExist = await Number.findOne({
        $and: [
          { number_character: req.body.number_character },
        ],
      })
      if (dataExist) {
        await returnCommonResponse(res, 400, 'This Name Already Exists', {})
      } else {
        const addingNumbers = new Number(body)
        const insertValues = await addingNumbers.save()
        await returnCommonResponse(res, 201, 'Data added successfully', { data: insertValues })
      }
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const updateNumberCharacter = async (req, res) => {
  try {
    const _id = req.params.id
    let bodyObject

    if (req.body.color_code) {
      bodyObject = { ...bodyObject, color_code: req.body.color_code }
    }

    if (req.body.name) {
      bodyObject = { ...bodyObject, name: req.body.name }
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

    const updatedNumber = await Number.findByIdAndUpdate(_id, bodyObject, { new: true })

    if (updatedNumber) {
      await returnCommonResponse(res, 200, 'Number updated successfully', updatedNumber)
    } else {
      await returnCommonResponse(res, 404, 'Data not found!', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const getNumberCharacter = async (req, res) => {
  try {
    const data = await numbersList()
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
  addNumberCharacter,
  getNumberCharacter,
  updateNumberCharacter,
}
