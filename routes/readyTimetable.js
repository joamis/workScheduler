const errors = require('restify-errors');
const Timetable = require('../models/Group');
const config = require('../config');


module.exports = server => {

    server.get('/readyTimetable/:student_id', async (req, res, next) => {

        try {
            const readyTimetable = await Timetable.find({});
            res.send(readyTimetable);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });


    server.post('/readyTimetable/:student_id', async (req, res, next) => {
            // Check for JSON
            if (!req.is('application/json')) {
                return next(
                    new errors.InvalidContentError("Expects 'application/json'")
                );
            }

            const { listOfGroups } = req.body;

            const readyTimetable = new Timetable({
                listOfGroups
            });

            try {
                const newTimetable = await readyTimetable.save();
                res.send(201);
                next();
            } catch (err) {
                return next(new errors.InternalError(err.message));
            }
        }
    );
}