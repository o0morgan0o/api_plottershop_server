const jwt = require('jsonwebtoken')
const util = require('util')
const upload = require('../fileUpload').upload
const loggedIn = require('./login')
const fs = require('fs')
const path = require('path')
const { getFilesFromRequest, deleteFilesOnServer, getFilesToRemove, concatPreviousAndNewImgOthers, removeImagesInImgOthers } = require('./helpers/updateFunctions')



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


        let files_to_delete = []
        connection.query(query, (err, results) => {
            if (err) throw err
            files_to_delete.push(results[0].img_main)
            for (let i = 0; i < results[0].img_others.length; i++) {
                files_to_delete.push(results[0].img_others[i])
            }
            // deleteFilesOnServer(files_to_delete)
        })
        query = `delete from items where id='${req.params.id}'`
        connection.query(query, (err, results) => {
            if (err) throw err
            if (results.affectedRows == 1) {
                object.status = "success"
                object.affectedRows = results.affectedRows
                object.warningCount = results.warningCount
                object.deleteFiles = files_to_delete
            }
            res.json(object)
        })
    })


    app.post('/admin/updateitem', loggedIn, upload.fields([
        { name: 'file_main', maxCount: 1 },
        { name: 'file_others', maxCount: 5 },
    ]), (req, res, next) => {
        //handle if there is 
        //TODO add upload + validation
        let [newFile_main, newFile_others] = getFilesFromRequest(req.files)
        let files_remove = getFilesToRemove(req.body.removeFile)
        let item = req.body
        // getItem(connection, item.id,)
        connection.query(`select * from items where id = '${item.id}'`, (err, results) => {
            if (err) throw err
            if (results[0]) {
                const oldItem = results[0]
                const arrayFileOthers = concatPreviousAndNewImgOthers(oldItem.img_others, newFile_others)
                let [filteredArrayFileOthers, removedElementsOthers] = removeImagesInImgOthers(arrayFileOthers, files_remove)
                const img_others_json = JSON.stringify(filteredArrayFileOthers)


                // TODO change aloso pictures
                let query = "UPDATE items SET"
                if (newFile_main) query += ` img_main = '${newFile_main}',`
                if (item.title) query += ` title = '${item.title}',`
                if (item.subtitle) query += ` subtitle = '${item.subtitle}',`
                if (item.description_1) query += ` description_1 = '${item.description_1}',`
                if (item.description_2) query += ` description_2 = '${item.description_2}',`
                if (item.size) query += ` size = '${item.size}',`
                if (item.devise) query += ` devise = '${item.devise}',`
                if (item.viewable) query += ` viewable = ${item.viewable === true},`
                if (item.sold) query += ` sold = ${item.sold === true},`
                if (img_others_json) query += ` img_others = '${img_others_json}',`
                if (item.promotion) query += ` promotion = '${item.promotion}'`
                query += ` WHERE id = '${item.id}'`
                console.log(query)
                let resultStatus = 'unknows'



                connection.query(query, (err, results) => {
                    if (err) throw err
                    // console.log(results)
                    if (newFile_main) deleteFilesOnServer([oldItem.img_main])
                    deleteFilesOnServer(removedElementsOthers)
                    resultStatus = 'success'
                    res.json({
                        id: item.id,
                        affectedRows: results.affectedRows,
                        status: resultStatus,
                        warningCount: results.warningCount,
                        removedElementsOthers: removedElementsOthers,
                        removedElementMain: [oldItem.img_main]

                    })
                })
            }
            else {
                console.log('error during reading')
            }
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

// async function getItem(connection, id, cb) {
//     const query = `select * from items where id='${id}'`
//     return await.promisify(connection.query(query, (err, results) => {
//         if (err) throw err
//         if (results[0]) {
//             return results[0]
//         }
//         else {
//             console.log('error in getItem')
//             return 'no result to return'

//         }
//     })
// }
