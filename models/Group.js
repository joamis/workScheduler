const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    date: String,
    numberOfPeople: Number,
    groupID: Number
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = {GroupSchema, Group}