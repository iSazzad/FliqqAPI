const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already Exists"],
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
  id_token: {
    type: String,
  },
  email_verified: {
    type: Boolean,
  },
  is_active: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true
})

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const passwordHash = await securePassword(this.password);
    this.password = passwordHash;
    next();
  }
});

userSchema.pre(["updateOne", "findByIdAndUpdate", "findOneAndUpdate"], async function (next) {
  const data = this.getUpdate();
  if (data.password) {
    data.password = await securePassword(data.password);
  }

  next()
});

const User = new mongoose.model('User', userSchema)

module.exports = User
