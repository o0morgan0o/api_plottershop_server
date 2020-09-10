const dotenv = require('dotenv')
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

const app = express()
dotenv.config()
//TODO investigate on mysql security queries

// ------------------------
// Connect to Mysql
const connection = mysql.createConnection({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})
connection.connect()
// END MYSQL =====================

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: "http://37.187.120.211:3000",
    credentials: true
}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))
app.use(flash())
app.use(express.static('uploads'))

// -------------------------
// Passport
const initializePassport = require('./passport-config')
initializePassport(passport, connection)
app.use(passport.initialize())
app.use(passport.session())
// END Middleware =====================



// -------------- ROUTES ------------------
require('./routes')(app, connection)



const port = process.env.PORT || 4444
app.listen(port, process.env.SERVER_IP, () => console.log(`listening on port ${port}`))
