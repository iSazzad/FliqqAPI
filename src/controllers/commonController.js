const SvgModel = require('../models/svgModel')

const alphabetsSvgArray = async () => {
  return new Promise(async function (resolve, reject) {
    const alphabetArray = await SvgModel.find({})

    if (alphabetArray.length == 0) {
      reject([])
    }
    var arr = []
    await alphabetArray.forEach((element, index) => {
      const newObj = {
        svg_url: element.svg_url.path,
        chara_voice_url: element.chara_voice_url.path,
        _id: element._id,
        alpha_character: element.alpha_character,
        color_code: element.color_code,
      }
      arr.push(newObj)

      if (alphabetArray.length == index + 1) {
        resolve(arr)
      }
    })
  })
}

module.exports = alphabetsSvgArray
