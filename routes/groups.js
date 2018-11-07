const errors = require('restify-errors');
const config = require('../config');

module.exports = server => {
    server.get('/Groups', async (req, res, next) => {

        try {
            const Groups = await Group.find({});
            res.send(Groups);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });


    server.get('/Groups/:id', async (req, res, next) => {

        try {
            const Group = await Group.findById(req.params.id);
            res.send(Group);
            next();
        } catch (err) {

            return next(new errors.ResourceNotFoundError(`There is no Group with this id of ${req.params.id}`));
        }

    });


    server.post('/Groups', async (req, res, next) => {

        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json"))
        }

        const {nameOfSubject, numberOfGroup, timeOfStart, timeOfEnd, nameOfTeacher, nameOfRoom} = req.body;
        const Group = new Group({
            nameOfSubject,
            numberOfGroup,
            timeOfStart,
            timeOfEnd,
            nameOfTeacher,
            nameOfRoom
        });

        try {

            const newGroup = await Group.save();
            res.send(201);
            next();
        }
        catch (err) {

            return next(new errors.InternalError(err.message));
        }
    });

}