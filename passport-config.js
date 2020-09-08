const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, connection) {

    const authenticateUser = (req, name, password, done) => {
        console.log('authentication asked ', name, password)
        // connection.connect(err => {
        //     if (err) throw err;
        //     console.log('connected to database')
        connection.query('use plotter_shop', (err, result) => {
            if (err) throw err
            connection.query("select * from users where name = '" + name + "'", function (err, rows) {
                if (err)
                    return done(err)

                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found'))
                }

                if (!(rows[0].password == password)) {
                    return done(null, false, req.flash('loginMessage', 'Opps wrong password'))
                }

                // if we are here auth is successfull
                console.log('auth success')
                return done(null, rows[0])
            })
        })
        // })


    }
    passport.use('local-login', new LocalStrategy({
        usernameField: 'name',
        passwordField: 'password',
        passReqToCallback: true
    }, authenticateUser))

    passport.serializeUser((user, done) => {
        done(null, user.name)

    })
    passport.deserializeUser((id, done) => {
        connection.query("select * from users where name= '" + id + "'", (err, rows) => {
            done(err, rows[0])
        })

    })

}

module.exports = initialize