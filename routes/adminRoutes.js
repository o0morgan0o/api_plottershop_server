const jwt = require('jsonwebtoken')
const upload = require('../fileUpload').upload
const loggedIn = require('./login')
const fs = require('fs')
const path = require('path')

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
        try {
            let files = req.files
            //construction of stringify array
            const img_main = files[0].filename
            let img_others = []
            for (let i = 1; i < files.length; i++) {
                if (files[i]) {
                    img_others.push(files[i].filename)
                }
            }
            const img_others_json = JSON.stringify(img_others)
            const query = `insert into items( title, subtitle,description_1, description_2,img_main, img_others, size, devise, viewable, sold, promotion) 
            VALUES ('${item.title}', '${item.subtitle}','${item.description_1}', '${item.description_2}','${img_main}', '${img_others_json}',
            '${item.size}', '${item.devise}' , ${item.viewable} , ${item.sold}, '${item.promotion}')`
            connection.query(query, (err, results) => {
                let resultStatus = 'unknown'
                if (err) throw err
                if (results.insertId) {
                    resultStatus = "success"
                    console.log('INSERT SUCCESS')
                }
                else {
                    resultStatus = "error"
                    console.log("INSERT ERROR")
                }
                res.json({
                    status: resultStatus,
                    id: results.insertId,
                    affectedRows: results.affectedRows,
                    warningCount: results.warningCount
                })
            })
        } catch (err) {
            res.send("Error during upload " + err)
        }
    })

    app.delete('/admin/deleteitem/:id', loggedIn, (req, res, next) => {
        let object = {
            status: 'unknown',
            id: req.params.id,
            affectedRows: 'unknown',
            warningCount: 'unknown',
        }
        let query = `select * from items where id='${req.params.id}'`


        connection.query(query, (err, results) => {
            if (err) throw err
            let files_to_delete = []
            files_to_delete.push(results[0].img_main)
            for (let i = 0; i < results[0].img_others.length; i++) {
                files_to_delete.push(results[0].img_others[i])
            }
            for (let i = 0; i < files_to_delete.length; i++) {
                try {
                    fs.unlinkSync(`./uplaods_test/${files_to_delete[i]}`)
                } catch (e) { err => console.log(err) }
            }
        })
        query = `delete from items where id='${req.params.id}'`
        connection.query(query, (err, results) => {
            if (err) throw err
            if (results.affectedRows == 1) {
                object.status = "success"
                object.affectedRows = results.affectedRows
                object.warningCount = results.warningCount
            }
            res.json(object)
        })
    })


    app.post('/admin/updateitem', loggedIn, upload.fields([
        { name: 'file_main', maxCount: 1 },
        { name: 'file_others', maxCount: 5 },
    ]), (req, res, next) => {
        //TODO add upload + validation

        let files = req.files
        let file_main = null
        let files_others = []
        try {
            if (req.files['file_main'][0])
                file_main = req.files['file_main'][0].filename
            // TODO if we have this we must delete the old file T
        } catch (e) { console.log('error in img_main', e) }
        try {
            if (req.files['file_others'].length > 0)
                files_others = req.files['file_others']
        }
        catch (e) { console.log('error in img_others', e) }
        console.log('files others', files_others)

        console.log('nexxxxxxxxxxxxx')
        let img_others = []
        try {
            for (let i = 0; i < files_others.length; i++) {
                if (files_others[i].filename) {
                    img_others.push(files_others[i].filename)
                }
            }
        } catch (e) { console.log('error in img_others', e) }
        const img_others_json = JSON.stringify(img_others)
        // console.log('upppppppppppppp', req.body, req.params, files.lengt)
        // res.send('ok')
        let item = req.body
        console.log('item', item)
        // TODO change aloso pictures
        let query = "UPDATE items SET"
        if (file_main) query += ` img_main = '${file_main}',`
        if (item.title) query += ` title = '${item.title}',`
        if (item.subtitle) query += ` subtitle = '${item.subtitle}',`
        if (item.description_1) query += ` description_1 = '${item.description_1}',`
        if (item.description_2) query += ` description_2 = '${item.description_2}',`
        if (item.size) query += ` size = '${item.size}',`
        if (item.devise) query += ` devise = '${item.devise}',`
        if (item.viewable) query += ` viewable = ${item.viewable === true},`
        if (item.sold) query += ` sold = ${item.sold === true},`
        if (img_others.length > 0) query += ` img_others = '${img_others_json}',`
        if (item.promotion) query += ` promotion = '${item.promotion}'`
        query += ` WHERE id = '${item.id}'`
        console.log(query)
        let resultStatus = 'unknows'

        connection.query(query, (err, results) => {

            if (err) throw err
            console.log(results)
            resultStatus = 'success'
            res.json({
                id: item.id,
                affectedRows: results.affectedRows,
                status: resultStatus,
                warningCount: results.warningCount
            })
        })
        // res.send('ok')

    })

    app.get('/admin/delete_test_file_uploads', loggedIn, (req, res, next) => {
        const directory = 'uploads_test'
        fs.readdir(directory, (err, files) => {
            if (err) throw err
            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err
                })
            }
        })
        res.send('deleted')



    })




}
