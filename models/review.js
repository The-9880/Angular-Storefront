const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var reviewSchema = new Schema({
    username: String,
    itemName: String,
    comment: String,
    rating: Number,
    hidden: Boolean
});

module.exports = mongoose.model('reviews', reviewSchema);