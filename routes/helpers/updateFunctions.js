const fs = require('fs')

module.exports = {
    getFilesFromRequest: function (reqFiles) {
        let main = undefined
        let others = []
        try {
            main = reqFiles['file_main'][0]
        } catch (e) {
            main = undefined
        }
        others = reqFiles['file_others']
        if (others === undefined) others = []
        return [main, others]
    }
    ,
    deleteFilesOnServer: function (arr) {
        for (let i = 0; i < arr.length; i++) {
            try {
                fs.unlinkSync(`./uploads_test/${arr[i]}`)
            } catch (e) { err => console.log(err) }
        }
    },

    getFilesToRemove: function (filesToRemove) {
        let response = []
        if (filesToRemove === undefined) response = []
        else response = filesToRemove
        return response
    },

    concatPreviousAndNewImgOthers: function (oldItem, newItem) {
        let temp = JSON.parse(oldItem).concat(newItem)
        return temp
    },

    removeImagesInImgOthers: function (arr, filesToRemove) {
        let removedArray = []
        if (filesToRemove === undefined) return [arr, removedArray]
        if (Array.isArray(filesToRemove)) {
            let newArr = [...arr]
            for (let i = 0; i < filesToRemove.length; i++) {
                let index = newArr.indexOf(filesToRemove[i])
                if (index !== -1) {
                    removedArray.push(newArr[index])
                    newArr.splice(index, 1)
                }
            }
            return [newArr, removedArray]

        } else {
            // case where the filesToRemove is not an array but a string
            let newArr = [...arr]
            let index = arr.indexOf(filesToRemove)
            if (index !== -1) {
                removedArray.push(newArr[index])
                newArr.splice(index, 1)
            }
            return [newArr, removedArray]
        }
    }

}