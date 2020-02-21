const mongoose = require('mongoose');

const partitionSchema = new mongoose.Schema({
    title: String,
    subTitle: String,
    images: [String],
    description: String,
    composeur: String,
    pays:String,
    genre: String,
    instruments: [String],
    tonalite: String,
    createdOn: { type: Date, default : Date.now},
    partitionFile: String,
    abc: String,
    midi: String
});

module.exports = mongoose.model('Partition', partitionSchema);

/* 
const composeurSchema = new mongoose.Schema({
    name: String
});
module.exports = mongoose.model('Composeur', composeurSchema); */