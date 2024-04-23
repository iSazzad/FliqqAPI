const { JWT } = require('google-auth-library')
const User = require('../models/users')
const appleSignin = require('apple-signin-auth')
const { returnCommonResponse, createJwtToken, verifyGoogleToken } = require('../common/common')
const populateKeys = require('../common/populate.tablekeys')

/**
 * Social Authentication
 * @param {*} req 
 * @param {*} res 
 */
const socialAuthentication = async (req, res) => {
  if (req.body.social_type == 1) {
    googleAuthentication(req, res)
  } else if (req.body.social_type == 2) {
    appleAuthentication(req, res)
  } else {
    await returnCommonResponse(res, 400, 'Bad Request, Please check your parameters', req.body)
  }
}

/**
 * Login and Register with Google
 * @param {*} req 
 * @param {*} res 
 */
const googleAuthentication = async (req, res) => {
  try {
    verifyGoogleToken(req.body.social_token)
      .then(async (data) => {
        const result = await User.findOne({ email: data.email }, populateKeys.UserReferrence.key);
        if (result == null || result == undefined) {
          const user = new User({
            email: data.email,
            firstname: data.given_name,
            lastname: data.family_name,
            profile_url: data.picture,
            login_type: 1,
            id_token: req.body.social_token,
            email_verified: true,
            is_active: true,
          });
          const result = await user.save();
          const token = await createJwtToken({ id: result._id });
          result._doc.token = token;
          await returnCommonResponse(res, 201, 'User created succesfully', result)
        } else {
          if (result.login_type == 1) {
            const token = await createJwtToken({ id: result._id });
            result._doc.token = token;
            await returnCommonResponse(res, 200, 'User data get succesfully', result)
          } else {
            await returnCommonResponse(res, 403, 'Invalid login type mthod', result)
          }
        }
      })
      .catch(async (err) => {
        await returnCommonResponse(res, 403, 'Invalid Id Token', err)
      });
  } catch (error) {
    await returnCommonResponse(res, 500, 'Internal Server error', error)
  }
}

/**
 * Login and Register with Apple
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const appleAuthentication = async (req, res) => {
  try {
    const data = await appleSignin.verifyIdToken(req.body.idToken, {
      audience: '',
      ignoreExpiration: true,
    })
    if (data && data.email) {
      // Prepare object to get user details
      const conditions = {
        isDeleted: false,
        email: `${data.email}`,
        userType: 'apple',
      }
      // Get user detail
      let user = await Users.findOne(
        conditions,
        'firstName lastName email profileImageUrl userType'
      )
      if (user === undefined || user === null) {
        user = await db.models.users.create({
          userType: 'apple',
          email: data.email,
        })
      }
      const token = JWT.sign(
        {
          data: {
            _id: user._id,
            userType: user.userType,
            email: user.email,
          },
        },
        process.env.SECRET_KEY
      )
      const response = {
        token: token,
        _id: user._id,
        email: user.email,
      }
      res.status(200).json({
        data: { data: response },
        message: 'Login successfully',
      })
    } else {
      return res.status(400).json({
        message: 'Error while google login',
      })
    }
  } catch (error) {
    catchErrorLogs('Error while google login')
    catchErrorLogs(error)
    return res.status(400).json({
      message: 'Error while google login',
    })
  }
}

/**
 * Login for Admin
 * @param {*} req 
 * @param {*} res 
 */
const adminLogin = async (req, res) => {
  try {
    const email = req.body.email
    const admin = await User.findOne({
      email: email,
    }).exec()
    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      await returnCommonResponse(res, 400, "Invalid password", {})
    } else if (admin === undefined || admin === null) {
      await returnCommonResponse(res, 404, "Data not found", {})
    } else {
      const token = await createJwtToken({ id: admin._id, roll_type: admin._doc.roll_type });
      admin._doc.token = token;
      console.log("new token: ", token);
      await returnCommonResponse(res, 200, "login successfully", admin)
    }
  } catch (error) {
    await returnCommonResponse(res, 400, "invalid login", error)
  }
}

module.exports = {
  socialAuthentication,
  adminLogin,
}
