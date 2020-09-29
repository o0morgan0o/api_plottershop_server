module.exports = function (app) {
    app.get('*', (req, res) => {
        console.log(JSON.stringify(req.headers))
        res.send(`unknown route ${req.originalUrl}`)
    })



}
