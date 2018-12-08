const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
    nameOfSubject: {
        type: String,
        required: true,
        trim: true
    },
    groupID: {
        type: Number,
        required: true,
        trim: true
    },
    numberOfPoints: {
        type: Number,
        default: 0,
        required: true,
        trim: true
    }
});

const Preference = mongoose.model('Preference', PreferenceSchema);
module.exports = {PreferenceSchema, Preference};