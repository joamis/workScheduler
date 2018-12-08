const mongoose = require('mongoose');
const Group = require('../models/Group').GroupSchema;

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