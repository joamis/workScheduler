const errors = require('restify-errors');
const WorkScheduler = require('../backend/WorkScheduler');
const Subject = require('../models/Subject');
const Student = require('../models/Student');

module.exports = server => {

    server.get('/scheduleWork', async (req, res, next) => {
        try {
            const Subjects = await Subject.find({});
            const Students = await Student.find({});
            let workScheduler = new WorkScheduler(Subjects, Students)
            let calculatedWorkSchedule = workScheduler.calculateWorkSchedule()
            res.send(calculatedWorkSchedule);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });
}