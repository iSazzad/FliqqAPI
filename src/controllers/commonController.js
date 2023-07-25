const SvgModel = require('../models/AlphabetCollectionModel')

const alphabetsSvgArray = async () => {
  return new Promise(async function (resolve, reject) {
    const alphabetArray = await SvgModel.find({}).exec()

    if (alphabetArray.length == 0) {
      reject([])
    }
    var arr = []
    await alphabetArray.forEach((element, index) => {
      const newObj = {
        svg_url: `${element.svg_url.destination}/${element.svg_url.name}`,
        chara_voice_url: `${element.chara_voice_url.destination}/${element.chara_voice_url.name}`,
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
