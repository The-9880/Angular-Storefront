const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var itemSchema = new Schema({
    imageUrl: String,
    name: String,
    description: String,
    price: Number,
    stock: Number,
    amountSold: Number
});

module.exports = mongoose.model('Catalog', itemSchema);