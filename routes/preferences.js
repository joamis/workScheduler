const errors = require('restify-errors');
const Student = require('../models/Student')
const rjwt = require('restify-jwt-community');
const config = require('../config')

module.exports = server => {

    server.get('/preferences/:id' , async (req, res, next) => {
        try {
            const student = await Student.findById(req.params.id);
            const preferences = student.choices;
            res.send(preferences);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.post('/preferences/:id',async (req, res, next) => {
        try {
            const preferences = req.body
            let student = await Student.findById(req.params.id);
            student.choices = JSON.parse(preferences)
            student.save((err, updatedStudent) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                }
                else
                {
                        res.send(updatedStudent)
                }
            })
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });
}