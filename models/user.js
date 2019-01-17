const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var wishlistSchema = new Schema({
    name: String,
    quantity: Number
});

var userSchema = new Schema({
    email: String,
    password: String,
    authLevel: Number,
    wishlist: [wishlistSchema],
    cart: [wishlistSchema],
    listPublic: {type: Boolean, default: false},
    verified: {type:Boolean, default:false}
});

module.exports = mongoose.model('Users', userSchema);