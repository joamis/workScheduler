const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    balance: {
        type: Number,
        default: 0
    }
});

StudentSchema.plugin(timestamp);

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;