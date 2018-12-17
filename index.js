const restify = require('restify');
const mongoose = require('mongoose');
const config = require('./config');
mongoose.set('debug', false);
const rjwt = require('restify-jwt-community')

const server = restify.createServer();

// Middleware
server.use(restify.plugins.bodyParser());
server.use(
    function crossOrigin(req,res,next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        return next();
    }
);

//Protect routes
//server.use(rjwt({secret: config.JWT_SECRET}).unless({path: ['/auth']}))

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
    require('./routes/preferences')(server);
    require('./routes/groups')(server);
    require('./routes/scheduleWork')(server);
    require('./routes/readyTimetable')(server);
    require('./routes/users')(server);
    require('./routes/students')(server);
    require('./routes/subjects')(server);
    console.log(`Server started on port ${config.PORT}`);
});


