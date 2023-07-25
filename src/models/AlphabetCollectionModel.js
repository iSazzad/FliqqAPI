const mongoose = require('mongoose')

const AlphabetCollectionSchema = new mongoose.Schema({
  alpha_character: {
    type: String,
    required: true,
    unique: false,
  },
  svg_url: {
    path: {
      type: String,
    },
    originalName: {
      type: String,
    },
    name: {
      type: String,
    },
    destination: {
      type: String,
    },
  },
  color_code: {
    type: String,
  },
  chara_voice_url: {
    path: {
      type: String,
    },
    originalName: {
      type: String,
    },
    name: {
      type: String,
    },
    destination: {
      type: String,
    },
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_date: {
    type: Date,
    default: Date.now,
  },
})

//we will create new collection
const AlphabetCollectionModel = new mongoose.model(
  'SvgCollection',
  AlphabetCollectionSchema
)

module.exports = AlphabetCollectionModel
