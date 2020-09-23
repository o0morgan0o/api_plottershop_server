

module.exports = function (app, connection) {


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



}