const errors = require('restify-errors');
const WorkScheduler = require('../backend/WorkScheduler');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const rjwt = require('restify-jwt-community');
const config = require('../config')

module.exports = server => {

    server.post('/scheduleWork', async (req, res, next) => {
        try {
            const subjects = await Subject.find({});
            let students = await Student.find({});
            students.forEach((student) => { student.subjectsIds = []})
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

    server.post('/resetScheduleWork', async (req, res, next) => {
        try {
            let students = await Student.find({});
            console.log("ASD")
            students.forEach((student) => { student.subjectsIds = []})
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

    server.get('/scheduleWork', rjwt({secret: config.JWT_SECRET}) ,async (req, res, next) => {
        try {
            const Students = await Student.find({});
            res.send(Students)
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

}