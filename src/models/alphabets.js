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
  color_code: {
    type: String,
  },
}, {
  timestamps: true
})

const Alphabet = new mongoose.model('Alphabet', alphabetSchema)
module.exports = Alphabet
