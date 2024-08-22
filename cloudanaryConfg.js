//code to tell how to access cloudanary account

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name : process.env.CLOUDNAME,
    api_key : process.env.APIKEY,
    api_secret : process.env.APISECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'WanderLust_DEV',
      allowedFormates:["png" , "jpg" , "jpeg"]
    },
});

module.exports = {
    cloudinary , storage
}