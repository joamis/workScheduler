const errors = require('restify-errors');
const Student = require('../models/Student')

module.exports = server => {

    server.get('/preferences/:id', async (req, res, next) => {
        try {
            const student = await Student.findById(req.params.id);
            const preferences = student.choices;
            res.send(preferences);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.post('/preferences/:id', async (req, res, next) => {
        try {
            const preferences = req.body
            console.log('begin')
            console.log(preferences )
            console.log('end')
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