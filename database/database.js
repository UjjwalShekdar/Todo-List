const mongoose = require("mongoose");

const MONGO_URI = process.env

exports.connect = () => {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then()
    .catch((error) => {
        console.log("DB connection fail");
        console.log(error);
        process.exit(1)
    })
}