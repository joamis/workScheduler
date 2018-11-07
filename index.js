const restify = require('restify');
const mongoose = require('mongoose');
const config = require('./config');
mongoose.set('debug', true);
const server = restify.createServer();

// Middleware
server.use(restify.plugins.bodyParser());


server.listen(config.PORT, () => {
    mongoose.set('useFindAndModify', false);
    mongoose.connect(
        config.MONGODB_URI,
        { useNewUrlParser: true }
    );
});

const db = mongoose.connection;

db.on('error', err => console.log(err));

db.once('open', () => {
    //require('./routes/students')(server);
    require('./routes/preferences')(server);
    require('./routes/groups')(server);
    require('./routes/scheduleWork')(server);
    console.log(`Server started on port ${config.PORT}`);
});


