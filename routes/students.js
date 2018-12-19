const errors = require('restify-errors');
const Student = require('../models/Student');

module.exports = server => {


    server.get('/students', async (req, res, next) => {

        try {
            const students = await Student.find({});
            res.send(students);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.get('/students/:id', async (req, res, next) => {

        try {
            const student = await Student.findById(req.params.id);
            res.send(student);
            next();
        } catch (err) {

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }

    });

    server.post('/students', async (req, res, next) => {

        let choices = [];
        let levelOfSatisfaction = 0;
        let subjectsIds = [];

        const { name,surname,username } = JSON.parse(req.body);

        const student = new Student({
            name,
            surname,
            username,
            choices,
            levelOfSatisfaction,
            subjectsIds

        });

        try{

            const newStudent = await student.save();
            res.send(newStudent);
            next();
        }
        catch(err){

            return next( new errors.InternalError(err.message));
        }
    });

    server.put('/students/:id', async (req, res, next) => {

        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("Expects 'application/json"))
        }


        try{

            const student = await Student.findOneAndUpdate( {_id: req.params.id }, req.body);
            res.send(200);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }
    });


    server.del('/students/:id', async (req, res, next) => {

        try{

            const student = await Student.findOneAndRemove( {_id: req.params.id });
            res.send(204);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Student with this id of ${req.params.id}`));
        }
    });



}
