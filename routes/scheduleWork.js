const errors = require('restify-errors');
const WorkScheduler = require('../backend/WorkScheduler');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const rjwt = require('restify-jwt-community');
const config = require('../config')


module.exports = server => {

    server.get('/isScheduleCalculated', async (req, res, next) => {
        try {
            let students = await Student.find({});
            if (students[0].subjectsIds.length) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        }

        catch (err) {
            return next(new errors.InvalidContentError(err))
        }
    });

    server.post('/scheduleWork', async (req, res, next) => {
        try {
            const subjects = await Subject.find({});
            let students = await Student.find({});
            students.forEach((student) => {
                student.subjectsIds = [];
                student.levelOfSatisfaction = 0;
            })
            let workScheduler = new WorkScheduler(subjects, students)
            workScheduler.calculateWorkSchedule()
            console.log(workScheduler)
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

    server.post('/resetScheduleWork', rjwt({secret: config.JWT_SECRET}), async (req, res, next) => {
        console.log(req.user)
        try {
            let students = await Student.find({});
            students.forEach((student) => {
                student.subjectsIds = [];
                student.levelOfSatisfaction = 0;
            })
            students.forEach((student) => student.save((err) => {
                if (err) {
                    console.log(err)
                }
            }))
            res.send("success")
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.get('/scheduleWork', rjwt({secret: config.JWT_SECRET}), async (req, res, next) => {
        try {
            const Students = await Student.find({});
            res.send(Students)
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

}