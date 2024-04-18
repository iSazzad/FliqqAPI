const mongoose = require('mongoose')
const Alphabet = require("./alphabets");

const AlphabetWordCollectionSchema = new mongoose.Schema({
  alphabet: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: Alphabet
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
    required: true,
  },
})

const AlphabetWordCollection = new mongoose.model('AlphabetWordCollection', AlphabetWordCollectionSchema)
module.exports = AlphabetWordCollection
