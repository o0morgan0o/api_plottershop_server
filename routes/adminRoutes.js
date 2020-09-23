const jwt = require('jsonwebtoken')
const upload = require('../fileUpload').upload
const loggedIn = require('./login')

module.exports = function (app, connection, passport) {


    // ADMIN Routes ===========================
    app.get('/admin', loggedIn, (req, res) => {
        connection.query('select * from items', (err, result) => {
            if (err) throw err
            res.send('Welcome ' + req.user.name)
        })
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

    app.post('/admin/updateitem/:id', upload.array('files'), (req, res, next) => {
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




}
