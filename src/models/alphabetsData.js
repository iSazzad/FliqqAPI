const mongoose = require('mongoose')

const alphabetSchema = new mongoose.Schema({
  alpha_character: {
    type: String,
    required: true,
    unique: false,
  },
  image_url: {
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
  name: {
    type: String,
  },
  voice_url: {
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
const AlphabetData = new mongoose.model('Alphabet', alphabetSchema)

module.exports = AlphabetData
