const { OAuth2Client, JWT } = require('google-auth-library')
const User = require('../models/users')
const appleSignin = require('apple-signin-auth')
const { returnCommonResponse, createJwtToken, verifyGoogleToken } = require('../common/common')
const { UserReferrence } = require('../common/populateKeyObject')
const client = new OAuth2Client([process.env.CLIENT_ID])

const socialAuthentication = async (req, res) => {
  if (req.body.social_type == 1) {
    googleAuthentication(req, res)
  } else if (req.body.social_type == 2) {
    appleAuthentication(req, res)
  } else {
    await returnCommonResponse(res, 400, 'Bad Request, Please check your parameters', req.body)
  }
}

const googleAuthentication = async (req, res) => {
  try {
    verifyGoogleToken(req.body.social_token)
      .then(async (data) => {
        const result = await User.findOne({ email: data.email }, UserReferrence.keys);
        console.log("new id token1:", data, result);

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


const adminLogin = async (req, res) => {
  console.log('req login--->', req.body, process.env.ADMIN_PASSWORD)
  try {
    const email = req.body.email
    const adminFind = await Users.findOne({
      email: email,
    }).exec()
    console.log('adminFind login--->', adminFind)

    if (req.body.password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({
        message: 'Invalid password',
      })
    }
    if (adminFind === undefined || adminFind === null) {
      return res.status(404).json({
        message: 'Data not found',
      })
    }
    return res.status(200).json({
      message: 'login successfully',
      data: { data: adminFind },
    })
  } catch (e) {
    console.log('e-->', e)
    return res.status(400).json({
      message: 'invalid login',
      error: e,
    })
  }
}

module.exports = {
  socialAuthentication,
  adminLogin,
}
