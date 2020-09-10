const multer = require('multer')


const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        console.log('almost')
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage })

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