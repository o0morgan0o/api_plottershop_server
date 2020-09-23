const jwt = require('jsonwebtoken')
const upload = require('./fileUpload').upload

module.exports = function (app, connection, passport) {

    function loggedIn(req, res, next) {
        console.log("in login ", req.isAuthenticated())
        if (req.user) {
            console.log("authenticated")
            next();
        }
        else {
            console.log('fail')
            res.send('You are not authenticated, Please login !')
        }
    }

    // ADMIN Routes ===========================
    app.get('/admin', loggedIn, (req, res) => {
        connection.query('select * from items', (err, result) => {
            if (err) throw err
            res.send('Welcome ' + req.user.name)
        })
    })


    app.get('/test', loggedIn, (req, res) => {
        res.send('success')
    })

    app.post('/admin/additem', loggedIn, upload.array('files'), (req, res, next) => { // TODO rajouter login
        let item = req.body
        console.log('receiveing ... ', item)
        try {
            let files = req.files
            console.log('uploaded files : ', files)
            //construction of stringify array
            const img_main = files[0].filename
            let img_others = []
            for (let i = 1; i < files.length - 1; i++) {
                if (files[i]) {
                    img_others.push(files[i].filename)
                }
            }
            const img_others_json = JSON.stringify(img_others)
            const query = `insert into items( title, subtitle,description_1, description_2,img_main, img_others, size, devise, viewable, sold, promotion) 
            VALUES ('${item.title}', '${item.subtitle}','${item.description_1}', '${item.description_2}','${img_main}', '${img_others_json}',
            '${item.size}', '${item.devise}' , ${item.viewable} , ${item.sold}, '${item.promotion}')`
            connection.query(query, (err, results) => {
                if (err) throw err
                console.log(results.insertId)
                if (results.insertId)
                    console.log('INSERT SUCCESS')
                else {
                    console.log("INSERT ERROR")
                }
            })
            res.send(files)
        } catch (err) {
            res.send("Error during upload " + err)
        }
    })

    app.post('/admin/deleteitem/:id', (req, res, next) => {
        // TODO try to delete also the pictures maybe
        // TODO make login for production
        // try{
        let item = req.body
        if (item.id !== req.params.id) {
            console.log(item.id)
            res.send("something went wrong, id don't match")
            return
        }
        const query = `delete from items where id='${req.params.id}'`
        connection.query(query, (err, results) => {
            if (err) throw err
            console.log(results)
        })
        res.send('delete detected')
    })

    app.post('/api/updateitem/:id', upload.array('files'), (req, res, next) => {
        //TODO add upload + validation
        //get data

        let item = req.body
        // TODO change aloso pictures
        connection.query(`UPDATE items 
        SET title = '${item.title}', subtitle = '${item.subtitle}', description_1 = '${item.description_1}', description_2 = '${item.description_2}',
            size = '${item.size}', devise = '${item.devise}', viewable = ${item.viewable === true}, sold = ${item.sold === true}, promotion = '${item.promotion}' 
        WHERE id = ${req.params.id}`, (err, results) => {
            if (err) throw err
            // console.log(results)
            res.redirect('/api/items')
        })
    })


    // END ADMIN Routes ===========================






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
            else res.send("Non existing item")

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

    // app.get('/api/deleteitem/:id', (req, res) => {
    //     connection.query("delete from items where id='" + req.params.id + "'", (err, results) => {
    //         if (err) throw err
    //         console.log(results)
    //         res.redirect('/api/items')
    //     })
    // })
    app.get('*', (req, res) => {

        console.log('unknow request', req.body)
        res.send('unknown address')
    })


}