const AlphabetWordCollection = require('../models/alphabetwordcollections')

const { alphabetList, returnCommonResponse } = require('../common/common')
const { validationResult } = require('express-validator')
const { uploadOnCloudinary } = require('../common/cloudinary.service')

const addAlphabetWord = async (req, res) => {
  try {
    const body = { alphabet: req.body.alphabet, name: req.body.name }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() })
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

    const dataExist = await AlphabetWordCollection.findOne({ name: req.body.name })

    if (!dataExist) {
      const insertValues = await AlphabetWordCollection.create(body)
      await returnCommonResponse(res, 200, "Alphabet word added successfully", insertValues)
    } else {
      await returnCommonResponse(res, 400, "Name already Exist", {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server Error', error.message)
  }
}

const updateAlphabetWord = async (req, res) => {
  try {
    const _id = req.params.id
    let bodyObject

    if (req.body.name) {
      bodyObject = { name: req.body.name }
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

    const updatedAlphabetWord = await AlphabetWordCollection.findByIdAndUpdate(_id, bodyObject, { new: true })

    if (updatedAlphabetWord) {
      await returnCommonResponse(res, 200, 'Alphabet word updated successfully', updatedAlphabetWord)
    } else {
      await returnCommonResponse(res, 404, 'Data not found!', {})
    }
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server Error', error.message)
  }
}

const alphabetlist = async (req, res) => {
  try {
    const alphabetArray = await alphabetList()
    if (!Array.isArray(alphabetArray) || alphabetArray.length === 0) {
      await returnCommonResponse(res, 404, 'Data not found!', {})
    }

    const arrList = []
    for (const element of alphabetArray) {
      const dataArr = await AlphabetWordCollection.find({
        alphabet: element._id,
      })
      const newDataArr = dataArr.map(element => ({
        image_url: `${element.image_url.path}`,
        _id: element._id,
        name: element.name,
      }))
      arrList.push({ ...element, wordsList: newDataArr })
    }
    await returnCommonResponse(res, 200, 'data get successfully', arrList)
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

module.exports = {
  addAlphabetWord,
  updateAlphabetWord,
  alphabetlist,
}
