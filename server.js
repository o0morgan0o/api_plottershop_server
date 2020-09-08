const dotenv = require('dotenv')
const express = require('express')
const mysql = require('mysql')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const flash = require('express-flash')

dotenv.config()
const expressSession = require('express-session')({
    secret: process.env.SESSION_SECRET, // TODO make this env
    resave: false,
    saveUninitialized: false
})

const connection = mysql.createConnection({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})
connection.connect()

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    connection
)


const cors = require('cors')

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(expressSession)

app.use(passport.initialize())
app.use(passport.session())

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login')
    }

}


app.get('/admin', cors(), loggedIn, (req, res) => {
    connection.query('select * from items', (err, result) => {

        if (err) throw err

        res.send(result)
    })

})

app.get('/', (req, res) => {
    res.send('main')
})

app.get('/login', (req, res) => {
    req.flash('messge', 'this is a message')
    res.send('nope')
})

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/')





app.get('/api/getItems', (req, res) => {
    const items = [
        { id: 1, title: 'test', description: 'myadsjfaklsdjf' },
        { id: 1, title: 'test', description: 'myadsjfaklsdjf' },
        { id: 1, title: 'test', description: 'myadsjfaklsdjf' },
        { id: 1, title: 'test', description: 'myadsjfaklsdjf' },
    ]
    return res.json(items)
})


const port = process.env.PORT || 4444
app.listen(port, process.env.SERVER_IP, () => console.log(`listening on port ${port}`))

// connection.end()