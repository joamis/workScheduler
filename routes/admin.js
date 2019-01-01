const errors = require('restify-errors');
const auth = require('../routes/auth')
const jwt = require('jsonwebtoken');
const config = require('../config')



module.exports = server => {


    server.post('/admin', async (req, res, next) => {
        console.log(req.body)
        const {username, password} = JSON.parse(req.body);

        try {
            const admin = await auth.authenticateAdmin(username, password);
            //create token

            const token = jwt.sign(admin.toJSON(), config.JWT_SECRET, {
                expiresIn: '10000m'
            });

            const { iat, exp} = jwt.decode(token);

            //Respond with token
            res.send({ iat, exp, token});

        } catch (err) {
            return next(new errors.UnauthorizedError(err));
        }
    });
}
