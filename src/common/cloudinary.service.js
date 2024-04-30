const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, formatType) => {
    try {
        if (!localFilePath) return null

        let options = {
            resource_type: "auto",
        }

        if (formatType != undefined && formatType != null) {
            options["format"] = formatType
        }

        const response = await cloudinary.uploader.upload(localFilePath, options)
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        // fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.log("error--->", error)
        // fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}
module.exports = { uploadOnCloudinary }