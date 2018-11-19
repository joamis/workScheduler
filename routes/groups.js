const errors = require('restify-errors');
let Subject = require('../models/Subject')
let Group = require('../models/Groups');
const rjwt = require('restify-jwt-community');
const config = require('../config')


module.exports = server => {

    server.get('/groups' , async (req, res, next) => {

        try {

            const subjects = await Subject.find({});
            let groups = [];
            subjects.forEach((subject) => {
                for (let i = 0; i < subject.groups.length; i++) {
                    groups.push(new Group(subject.nameOfSubject, subject.groups[i].date, subject.groups[i].numberOfPeople, i+1));
                }
            });

            res.send(groups);
            next();
        }
        catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

}

