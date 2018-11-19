const errors = require('restify-errors');
const Student = require('../models/Student');
const Subject = require('../models/Subject')
let Group = require('../models/Groups')
const rjwt = require('restify-jwt-community');
const config = require('../config')


module.exports = server => {

    server.get('/readyTimetable/:id',async (req, res, next) => {

        try {
            const student = await Student.findById(req.params.id);
            const subjects = await Subject.find({});
            const groupsTable = [];
            subjects.forEach((subject) => subject.groups.forEach((group) => groupsTable.push(new Group(subject.nameOfSubject, group.date, group.numberOfPeople, group.groupID))));
            let filteredTable = [];
            student.subjectsIds.forEach((subjectId) => {
                filteredTable.push(...groupsTable.filter((group) => {
                    return (group.nameOfSubject === subjectId.nameOfSubject) && (group.groupID === subjectId.groupID)
                }))
            })
            res.send(filteredTable);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });
}