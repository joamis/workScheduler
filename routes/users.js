const errors = require('restify-errors');
const User = require('../models/User');
const bcrypt = require('bcryptjs')
const auth = require('../routes/auth')
const jwt = require('jsonwebtoken');
const config = require('../config')
const Student = require('../models/Student')


module.exports = server => {
    server.post('/register', async (req, res, next) => {
        const {username, password} = JSON.parse(req.body)

        const student = await Student.findOne({username})

        if(student != null) {
            const user = new User({
                username,
                password
            });


            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, async (err, hash) => {
                    user.password = hash;
                    user.save((err) => {
                        if (err) {
                            res.status(409)
                            res.send('Duplikat')
                        }
                    })
                })
            })
        }
        else {
            res.send('Nie ma takiego studenta')
        }

    });

    server.post('/auth', async (req, res, next) => {
        const {username, password} = JSON.parse(req.body);

        student = await Student.findOne({username})

        try {
            const user = await auth.authenticate(username, password);

            //create token

            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {

                expiresIn: '10000m'
            });

            const { iat, exp} = jwt.decode(token);

            //Respond with token
            res.send({ iat, exp, token, student});

        } catch (err) {
            return next(new errors.UnauthorizedError(err));
        }
    });
}
