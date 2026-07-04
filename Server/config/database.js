const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    const mongoUri = process.env.MONGODB_URL ;

    mongoose.connect(mongoUri)
        .then(() => {
            console.log("DB Connected Successfully");
        })
        .catch((error) => {
            console.log("DB connection failed");
            console.error(error);
            process.exit(1);
        })
}