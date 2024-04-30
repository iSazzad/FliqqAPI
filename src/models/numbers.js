const mongoose = require('mongoose')

const numberSchema = new mongoose.Schema({
  number_character: {
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
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
})

const Number = new mongoose.model('Number', numberSchema)
module.exports = Number
