const errors = require('restify-errors');
const User = require('../models/User');
const bcrypt = require('bcryptjs')
const auth = require('../routes/auth')
const jwt = require('jsonwebtoken');
const config = require('../config')
const Subject = require('../models/Subject')


module.exports = server => {

    server.get('/subjects', async (req, res, next) => {

        try {
            const subjects = await Subject.find({});
            res.send(subjects);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    server.get('/subjects/:id', async (req, res, next) => {

        try {
            const subject = await Subject.findById(req.params.id);
            res.send(subject);
            next();
        } catch (err) {

            return next(new errors.ResourceNotFoundError(`There is no Subject with this id of ${req.params.id}`));
        }

    });

    server.post('/subjects', async (req, res, next) => {
        const { nameOfSubject, groups } = JSON.parse(req.body);
        console.log(nameOfSubject)
        console.log(groups)
        const subject = new Subject({
            nameOfSubject,
            groups
        });

        try{

            const newSubject = await subject.save();
            res.send(newSubject);
            next();
        }
        catch(err){

            return next( new errors.InternalError(err.message));
        }
    });

    server.put('/subjects/:id', async (req, res, next) => {
        console.log(req.body)
        try{
            const subject = await Subject.findOneAndUpdate( {_id: req.params.id }, req.body);
            res.send(200);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Subject with this id of ${req.params.id}`));
        }
    });

    server.del('/subjects/:id', async (req, res, next) => {

        console.log('deletion')

        try{

            const subject = await Subject.findOneAndRemove( {_id: req.params.id });
            res.send(200);
            next();
        }
        catch(err){

            return next(new errors.ResourceNotFoundError(`There is no Subject with this id of ${req.params.id}`));
        }
    });

}