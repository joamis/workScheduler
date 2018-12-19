const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Admin = require('../models/Admin')



exports.authenticate = (username, password) => {
    return new Promise( async (resolve, reject) => {
        try {
            const user = await User.findOne({username})


            bcrypt.compare(password, user.password, (err, isMatch) => {
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

exports.authenticateAdmin = (username, password) => {
    return new Promise( async (resolve, reject) => {
        try {
            const admin = await Admin.findOne({username})


            bcrypt.compare(password, admin.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    resolve(admin);
                } else {
                    reject('Bad password');
                }
            });

        } catch(err){
            reject('Authentication failed. Admin does not exist');
        }
    });
}