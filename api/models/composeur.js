const mongoose = require('mongoose');

const composeurSchema = new mongoose.Schema({
    name: [String]
});
module.exports = mongoose.model('Composeur', composeurSchema);