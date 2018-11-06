const mongoose = require('mongoose');


const GroupSchema = new mongoose.Schema({

    nameOfSubject: {
        type: String,
        required: true,
        trim: true
    },

    numberOfGroup: {
        type: Number,
        required: true,
        trim: true
    },

    timeOfStart: {
        type: Date,
        required: true,
        trim: true
    },

    timeOfEnd: {
        type: Date,
        required: true,
        trim: true
    },

    nameOfTeacher: {
        type: String,
        required: true,
        trim: true
    },

    nameOfRoom: {
        type: String,
        required: true,
        trim: true
    }

});


const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;