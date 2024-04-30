const mongoose = require('mongoose')

const allTypeWordSchema = new mongoose.Schema({
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
  content_type: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
})

// content_type for Different type of content
/*
1 = Animal
2 = Bird
3 = Color
4 = Flower
5 = Fruit
6 = Shape
*/

const AllTypeWord = new mongoose.model('AllTypeWord', allTypeWordSchema)
module.exports = AllTypeWord
