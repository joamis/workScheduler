const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    date: Date,
    numberOfPeople: Number,
    groupID: Number
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = {GroupSchema, Group}