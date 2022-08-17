const config = require('config.js');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://interview:welcome2byteridge@byteridge-hdrl6.mongodb.net/surya", { useCreateIndex: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;
console.log("mongodb connected")
module.exports = {
    History: require('../history/history.model'),
    User: require('../users/user.model')
    
};