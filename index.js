const restify = require('restify');
const mongoose = require('mongoose');
const config = require('./config');
mongoose.set('debug', false);
const corsMiddleware = require('restify-cors-middleware')

const server = restify.createServer();

// Middleware
server.use(restify.plugins.bodyParser());

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)

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
    require('./routes/admin')(server);
    console.log(`Server started on port ${config.PORT}`);
});


