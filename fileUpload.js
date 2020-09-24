const multer = require('multer')


const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        if (process.env.NODE_ENV === "test") {
            cb(null, './uploads_test')
        } else {
            cb(null, './uploads')
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})


const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
        return cb(new Error('Only .png, .jpg, or .jpeg format allowed'))
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter })


// TODO : make file validation
// function fileFilter(req, file, cb) {
//     //to reject the filll pass false
//     cb(null, false)
//     // to accept the file
//     cb(null, true)
//     //pass error if something wrong
//     cb(new Error('I do not have a clue'))
// }

module.exports = { upload }