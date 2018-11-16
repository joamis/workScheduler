const mongoose = require('mongoose');

const Group = new mongoose.Schema({
    date: String,
    numberOfPeople: Number
});

const SubjectSchema = new mongoose.Schema({
    nameOfSubject: {
        type: String,
        required: true,
        trim: true
    },
    groups: [Group]
});

module.exports.getAllGroups = (callback) => {
    Group.find(callback);
}

const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;