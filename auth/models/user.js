const mongosse = require('mongoose');

const userSchema = new mongosse.Schema({
    username: {type:String, required:true},
    password: {type:String, required:true},
    createdOn: { type: Date, default:Date.now }
});

module.exports = mongosse.model('Usre', userSchema );