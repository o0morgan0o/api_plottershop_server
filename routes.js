const upload = require('./fileUpload').upload
module.exports = function (app, connection) {
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

    app.post('/admin/additem', upload.array('files'), (req, res, next) => {
        let item = req.body
        // console.log('item', formData.get('item'))
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
        // construct the 

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

}