const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');


exports.authenticate = (username, password) => {
    return new Promise( async (resolve, reject) => {
        try {
            const user = await User.findOne({username})


            bcrypt.compare(password, user.password, (err, isMatch) => {
                console.log('aaaaaaaaaaaaaaaaaaaaaa')
                if (err) throw err;
                if (isMatch) {
                    resolve(user);
                } else {
                    reject('Bad password');
                }
            });

        } catch(err){
            reject('Authentication failed. Username does not exist');
        }
    });
}