const errors = require('restify-errors');
const Subject = require('../models/Subject')
const config = require('../config');

module.exports = server => {

    server.get('/subjects', async (req, res, next) => {
        try {
            const SubjectResult = await Subject.find({});
            res.send(SubjectResult);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });
}