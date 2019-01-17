const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var verifySchema = new Schema({
    code: String,
    email: String
});

module.exports = mongoose.model('Verify', verifySchema);