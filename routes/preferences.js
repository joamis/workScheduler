const errors = require('restify-errors');
const Preference = require('../models/Preference');
const config = require('../config');

module.exports = server => {
    // Get Preferences
    server.get('/Preferences', async (req, res, next) => {

        try {
            const Preferences = await Preference.find({});
            res.send(Preferences);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.get('/Preferences/:id', async (req, res, next) => {

        try {
            const Preference = await Preference.findById(req.params.id);
            res.send(Preference);
            next();
        } catch (err) {

            return next(new errors.ResourceNotFoundError(`There is no Preference with this id of ${req.params.id}`));
        }

    });

    server.post('/Preferences', async (req, res, next) => {
            // Check for JSON
            if (!req.is('application/json')) {
                return next(
                    new errors.InvalidContentError("Expects 'application/json'")
                );
            }

            const { nameOfSubject, numberOfGroup, numberOfPoints, indexNumberOfStudent } = req.body;

            const preference = new Preference({
                nameOfSubject,
                numberOfGroup,
                numberOfPoints,
                indexNumberOfStudent
            });

            try {
                const newPreference = await preference.save();
                res.send(201);
                next();
            } catch (err) {
                return next(new errors.InternalError(err.message));
            }
        }
    );

    server.put('/Preferences/:id', async (req, res, next) => {

        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("Expects 'application/json"))
        }


        try{

            const Preference = await Preference.findOneAndUpdate( {_id: req.params.id }, req.body);
            res.send(200);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }
    });


    server.del('/Preferences/:id', async (req, res, next) => {

        try{

            const Preference = await Preference.findOneAndRemove( {_id: req.params.id });
            res.send(204);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Preference with this id of ${req.params.id}`));
        }
    });



}