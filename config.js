module.exports= {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    URL: process.env.BASE_URL || 'http://localhost:3000',
   // MONGODB_URI: process.env.MONGODB_URI || 'mongodb://student:student123@ds151383.mlab.com:51383/work_scheduler',]
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/local',
    JWT_SECRET: process.env.JWT_SECRET || 'secret1'
}