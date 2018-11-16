const errors = require('restify-errors');
let Subject = require('../models/Subject')


class Group
{
    constructor(nameOfSubject, date, numberOfPeople, groupID)
    {
        this.nameOfSubject = nameOfSubject;
        this.date = date;
        this.numberOfPeople = numberOfPeople;
        this.groupID = groupID;
    }
}
module.exports = server => {

    server.get('/groups', async (req, res, next) => {

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

