const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
  },
  profile_url: {
    type: String,
  },
  login_type: {
    type: Number,
    default: 0,
  },
  roll_type: {
    type: Number,
    default: 2,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_date: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
  },
  id_token: {
    type: String,
    // required: true,
  },
})

// Generating token
// userSchema.methods.generateAuthToken = async function () {
//   try {
//     const token = jwt.sign({ _id: this._id.toString }, process.env.SECRET_KEY, {
//       expiresIn: '30d',
//     })
//     this.tokens = this.tokens.concat({ token: token })
//     await this.save()
//     return token
//   } catch (error) {
//     // res.send(error)
//     console.log('error token-->', error)
//   }
// }
//we will create new collection
const Users = new mongoose.model('Users', userSchema)

module.exports = Users
