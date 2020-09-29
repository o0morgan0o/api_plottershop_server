const dotenv = require('dotenv')
const fs = require('fs')
const express = require('express')
const mysql = require('mysql')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const cors = require('cors')
const https = require('https')

const app = express()
dotenv.config()
//TODO investigate on mysql security queries

// TODO make https (must be made with nginx and proxy)

// ------------------------
// Connect to Mysql
const connection = mysql.createConnection({

    database: (process.env.NODE_ENV === 'test') ? process.env.DB_TEST_NAME : process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})


connection.connect()
let myCors = function (req, res, next) {
    const whitelist = ['https://mroze-printings.com', 'https://mroze-printings.com/admin/additem', 'https://mroze-printings.com:5555', 'https://mroze-printings.com:5555/additem']
    console.log('something', req.originalUrl)

    let origin = req.headers.origin
    if (whitelist.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin)
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next()

}

app.use(myCors)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})
app.use(flash())
// app.use(express.static('uploads'))

// -------------------------
// Passport
const initializePassport = require('./passport-config')
initializePassport(passport, connection)
app.use(passport.initialize())
app.use(passport.session())
// END Middleware =====================



// -------------- ROUTES ------------------
require('./routes/publicRoutes')(app, connection)
require('./routes/loginRoutes')(app, connection, passport)
require('./routes/adminRoutes')(app, connection, passport)
require('./routes/unknownRoute')(app)




const port = process.env.PORT || 4444
// app.listen(port, process.env.SERVER_IP, () => console.log(`listening on port ${port}`))
app.listen(port, `127.0.0.1`, () => console.log(`listening on local host, port ${port}`))

module.exports = app
