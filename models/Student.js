const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    surname: {
        type: String,
        required: true,
        trim: true
    },

    indexNumber: {
        type: Number,
        required: true,
        trim: true
    },

    idOfClass: {
        type: Number,
        required: true,
        trim: true

    },

    levelOfSatisfaction: {
        type: Number,
        required: true,
    }

});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;