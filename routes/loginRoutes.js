const jwt = require('jsonwebtoken')
const loggedIn = require('./login')

module.exports = function (app, connection, passport) {

    app.post('/login', (req, res, next) => {
        passport.authenticate('local-login', function (err, user, info) {

            if (err) throw err
            if (!user) res.send('username or password incorrect !')
            else {
                req.logIn(user, err => {
                    if (err) throw err
                    // creation of a web token
                    let token = jwt.sign({ data: user.name }, 'secret', { expiresIn: '1h' })
                    // console.log(token)
                    user.token = token

                    res.send(user.name)
                })
            }
            // console.log('should exist ', req.user)
            // console.log(req.isAuthenticated())
        })(req, res, next)
    })

    app.get('/user', loggedIn, (req, res) => {
        console.log('receiving user request')
        res.send(req.user)
    })

    app.get('/logout', (req, res) => {
        console.log('should end sesssion and redirect')
        req.logout()
        // res.redirect('/')
        console.log('aaa')
        res.send("LOGGED OUT")
        // req.session.regenerate(err => {
        //     if (err) throw err
        //     res.send('successfully end session')
        // })
    })

}