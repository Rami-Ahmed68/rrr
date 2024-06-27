const cloudinary = require("cloudinary");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path : "../../config/.env" });
const ApiErrors = require("../validation_error/ApiErrors");

// create cloudinary config
cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
});

const UploadCloudinary = async (file , next) => {
    try {

        // create the image path 
        const imagePath = path.join(__dirname , `../../../images/${file.filename}`);

        // upload to the cloudinary cloud
        const data = await cloudinary.uploader.upload(imagePath , {
            resource_type : "auto"
        });

        // return the uploaded image url
        return data.secure_url;

    } catch (error) {
        // return the error if the uploading failed
        return next(new ApiErrors(error , 500));
    }
};

module.exports = UploadCloudinary;