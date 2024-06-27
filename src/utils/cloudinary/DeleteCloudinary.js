const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config({ path : "../../config/.env" });

const ApiErrors = require("../../utils/validation_error/ApiErrors");

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
});

const DeleteCloudinary = async (image , next) => {
    try {

        //split the image url 
        const imageData = image.split("/");

        // extract the image publick Id
        const publicId = imageData[imageData.length - 1].split(".")[0];

        // delete the image from cloudinary by his public Id
        const Data = await cloudinary.uploader.destroy(publicId);

        // retur the Data
        return Data;

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
};

module.exports = DeleteCloudinary;