const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    date: String,
    numberOfPeople: Number,
    groupID: Number,
    dayOfWeek: String,
    startTime: String,
    duration: Number
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = {GroupSchema, Group}