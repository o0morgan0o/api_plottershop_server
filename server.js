const dotenv = require('dotenv')
const express = require('express')
const mysql = require('mysql')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
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

// ------------------------
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



// -------------------------
// Passport
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    connection
)
app.use(passport.initialize())
app.use(passport.session())


function loggedIn(req, res, next) {
    // console.log("in login ", req.user, req.session)
    if (req.user) { next(); }
    else {
        // res.redirect('/login')
        res.send('nothin')
    }
}


// Routes
app.get('/admin', loggedIn, (req, res) => {
    connection.query('select * from items', (err, result) => {
        if (err) throw err
        res.send('Welcom ' + req.user.name)
    })
})

app.get('/', (req, res) => {
    res.send('main')
})

app.get('/login', (req, res) => {
    req.flash('messge', 'this is a message')
})

app.get('/user', (req, res) => {
    res.send(req.user)
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local-login', function (err, user, info) {
        if (err) throw err
        if (!user) res.send('no user exist')
        else {
            req.logIn(user, err => {
                if (err) throw err
                res.send(req.user)
                // res.redirect('/admin')
            })
        }
    })(req, res, next)
})

app.post('/admin/additem', (req, res) => {
    const item = req.body.item
    const query = `insert into items( title, subtitle,description_1, description_2,img_main, img_others, size, devise, viewable, sold, promotion) 
    VALUES ('${item.title}', '${item.subtitle}','${item.description_1}', '${item.description_2}','${item.img_main}', '${item.img_others}',
        '${item.size}', '${item.devise}' , ${item.viewable} , ${item.sold}, '${item.promotion}')`

    connection.query(query, (err, results) => {
        if (err) throw err
        console.log(results.insertId)
        if (results.insertId)
            res.send('INSERT SUCCESS')
        else {
            res.send("INSERT ERROR")
        }

    })
})



app.post('/test', (req, res) => {
    console.log('detected')
    res.send('ok')
})

app.get('/user', (req, res) => {
    res.send(req.user)
})

app.get('/endsession', (req, res) => {
    req.session.regenerate(err => {
        if (err) throw err
        res.send('successfully end session')
    })
})





app.get('/api/items', (req, res) => {
    console.log("call detected")
    //public route should be accessible for anybody 
    connection.query('select * from items', (err, results) => {
        if (err) throw err
        res.send(results)
    })
})

app.get('/api/item/:id', (req, res) => {
    connection.query("select * from items where id='" + req.params.id + "'", (err, results) => {
        if (err) throw err
        if (results[0])
            res.send(results[0])
        else res.send("404")

    })
})

// ADD A ITEM
app.post('/api/items', (req, res) => { //TODO protect route if not dev
    // app.post('/api/items', loggedIn, (req, res) => {
    connection.query("insert into items( title, description,tags, main_pic,other_pic) VALUES ('aa', 'aa', 'tt', 'tt', 'tt')", (err, results) => {
        if (err) throw err
        console.log(results.insertId)
        res.send('done')
    })
})

app.get('/api/deleteitem/:id', (req, res) => {
    connection.query("delete from items where id='" + req.params.id + "'", (err, results) => {
        if (err) throw err
        console.log(results)
        res.redirect('/api/items')
    })
})

app.get('/api/updateitem/:id', (req, res) => {
    let newTitle = 'updated'
    connection.query(`UPDATE items set title = '${newTitle}' where id = ${req.params.id}`, (err, results) => {
        if (err) throw err
        console.log(results)
        res.redirect('/api/items')
    })
})



const port = process.env.PORT || 4444
app.listen(port, process.env.SERVER_IP, () => console.log(`listening on port ${port}`))

// connection.end()