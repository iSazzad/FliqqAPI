const { check } = require('express-validator')

exports.alphabetCollection = [
  check('name').notEmpty().withMessage('Name is required'),
  check('image_url')
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
  check('color_code').notEmpty().withMessage('Color code is required'),
  check('alpha_character')
    .notEmpty()
    .withMessage('Alphabet Character is required'),
]
