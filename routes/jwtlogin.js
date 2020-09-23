
module.exports = function (req, res, next) {
    // console.log("in login ", req.isAuthenticated())
    console.log('middleware ...', req)

    console.log('jwt', req.body.user, req.body.password)
    // if (req.user) {
    //     // console.log("authenticated")
    //     next();
    // }
    // else {
    //     // console.log('fail')
    //     res.send('You are not authenticated, Please login !')
    // }
    next()
}
