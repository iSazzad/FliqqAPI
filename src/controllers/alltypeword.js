const AllTypeWord = require('../models/alltypewords')
const { returnCommonResponse, numbersList } = require('../common/common')
const { validationResult } = require('express-validator')
const { uploadOnCloudinary } = require('../common/cloudinary.service')
const populateKeys = require('../common/populate.tablekeys')

/**
 * Add New AllTypeWord Character with its Color Code
 * @param {*} req 
 * @param {*} res 
 */
const addAllTypeWordImage = async (req, res) => {
  try {
    const body = {
      content_type: req.body.content_type,
      name: req.body.name,
    }

    const errors = await validationResult(req)
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

      const dataExist = await AllTypeWord.findOne({
        $and: [
          { name: req.body.name, content_type: req.body.content_type },
        ],
      })
      if (dataExist) {
        await returnCommonResponse(res, 400, 'This Name Already Exists', {})
      } else {
        const addingData = new AllTypeWord(body)
        const insertValues = await addingData.save()
        await returnCommonResponse(res, 201, 'Data added successfully', { data: insertValues })
      }
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const updateAllTypeWordImage = async (req, res) => {
  try {
    const _id = req.params.id
    let bodyObject

    if (req.body.content_type) {
      bodyObject = { ...bodyObject, content_type: req.body.content_type }
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

    const updatedData = await AllTypeWord.findByIdAndUpdate(_id, bodyObject, { new: true })

    if (updatedData) {
      await returnCommonResponse(res, 200, 'Data updated successfully', updatedData)
    } else {
      await returnCommonResponse(res, 404, 'Data not found!', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

const getAllTypeWordImage = async (req, res) => {
  try {
    const dataArray = await AllTypeWord.find({ content_type: req.params.type }, populateKeys.AllTypeWordReferrence.key)

    if (dataArray.length > 0) {
      await returnCommonResponse(res, 200, 'Data get successfully', { data: dataArray })
    } else {
      await returnCommonResponse(res, 404, 'Data not found', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error ', error)
  }
}

module.exports = {
  addAllTypeWordImage,
  getAllTypeWordImage,
  updateAllTypeWordImage,
}
