const { check } = require('express-validator')

exports.alphabetCollection = [
  check('alpha_character').notEmpty().withMessage('Alphabet is required'),
  check('svg_url')
    .custom((value, { req }) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'image/png',
        'image/gif',
        'audio/mp3',
        'audio/mpeg',
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

exports.alphabetCharacter = [
  check('color_code').notEmpty().withMessage('color_code is required'),
  check('alpha_character')
    .notEmpty()
    .withMessage('alpha_character is required'),
]
