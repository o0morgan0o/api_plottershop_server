

module.exports = function (req, res, next) {
    // console.log("in login ", req.isAuthenticated())
    if (req.user) {
        // console.log("authenticated")
        next();
    }
    else {
        // console.log('fail')
        res.send('You are not authenticated, Please login !')
    }
}
