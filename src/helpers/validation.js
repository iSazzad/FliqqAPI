const { check } = require('express-validator')

exports.alphabetCollectioValidation = [
  check('alpha_character').notEmpty().withMessage('Alphabet is required'),
  check('svg_url')
    .custom((value, { req }) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'image/png',
        'image/gif',
      ]
      if (req.files && allowedMimeTypes.includes(req.files[0].mimetype)) {
        return true
      }
      return false
    })
    .withMessage(
      'Please upload an image in SVG, PNG, JPG, JPEG, or GIF format'
    ),
]

exports.alphabetData = [
  check('name').notEmpty().withMessage('name is required'),
  check('alpha_character')
    .notEmpty()
    .withMessage('alpha_character is required'),
]
