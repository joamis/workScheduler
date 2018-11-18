const errors = require('restify-errors');
const WorkScheduler = require('../backend/WorkScheduler');
const Subject = require('../models/Subject');
const Student = require('../models/Student');

module.exports = server => {

    server.post('/scheduleWork', async (req, res, next) => {
        try {
            const subjects = await Subject.find({});
            let students = await Student.find({});
            let workScheduler = new WorkScheduler(subjects, students)
            let calculatedWorkSchedule = workScheduler.calculateWorkSchedule()
            students.forEach((student) => student.save((err) => {
                if (err) {
                    console.log(err)
                }
            }))
            res.send(students)
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.get('/scheduleWork', async (req, res, next) => {
        try {
            const Students = await Student.find({});
            res.send(Students)
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

}