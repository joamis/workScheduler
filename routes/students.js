const errors = require('restify-errors');
const Student = require('../models/Student');
const config = require('../config');

module.exports = server => {
    // Get Students
    server.get('/Students', async (req, res, next) => {

        try {
            const Students = await Student.find({});
            res.send(Students);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.get('/Students/:id', async (req, res, next) => {

        try {
            const Student = await Student.findById(req.params.id);
            res.send(Student);
            next();
        } catch (err) {

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }

    });

    server.post('/Students', async (req, res, next) => {

        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("Expects 'application/json"))
        }

        const { name, email, balance } = req.body;
        const Student = new Student({
            name,
            email,
            balance
        });

        try{

            const newStudent = await Student.save();
            res.send(201);
            next();
        }
        catch(err){

            return next( new errors.InternalError(err.message));
        }
    });

    server.put('/Students/:id', async (req, res, next) => {

        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("Expects 'application/json"))
        }


        try{

            const Student = await Student.findOneAndUpdate( {_id: req.params.id }, req.body);
            res.send(200);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }
    });


    server.del('/Students/:id', async (req, res, next) => {

        try{

            const Student = await Student.findOneAndRemove( {_id: req.params.id });
            res.send(204);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }
    });



}
