const fs = require("fs");
const ApiErrors = require("../validation_error/ApiErrors");

const DeleteFiles = function (files , next) {
    // check if the files array length is more than 0 image
    if (files && files.length > 0) {
        files.forEach(file => {
            fs.unlink(file.path , (error) => {
                if (error) {
                    return next(new ApiErrors(error , 500));
                }
            })
        })
    }
};

module.exports = DeleteFiles;