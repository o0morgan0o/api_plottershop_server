const FormData = require('form-data')
module.exports = {
    getNewFormData: function (
        title = 'AddItem Title',
        subtitle = 'AddItem SubTitle',
        description_1 = "AddItem Description_1",
        description_2 = "AddItem Description_2",
        material = "AddItem Material",
        size = "AddItem Size",
        devise = "AddItem Devise",
        viewable = "true",
        price = "300",
        sold = "true",
        promotion = "AddItem Promotion",
        // file_main = fs.createReadStream('./test/placeholder.png')
    ) {
        let tmpFormData = new FormData()
        tmpFormData.append('title', title)
        tmpFormData.append('subtitle', subtitle)
        tmpFormData.append('description_1', description_1)
        tmpFormData.append('description_2', description_2)
        tmpFormData.append('material', material)
        tmpFormData.append('size', size)
        tmpFormData.append('devise', devise)
        tmpFormData.append('viewable', viewable)
        tmpFormData.append('price', price)
        tmpFormData.append('sold', sold)
        tmpFormData.append('promotion', promotion)
        return tmpFormData
    }
    ,
    getHeaderWithCookie: function (formData, cookie) {
        let header = formData.getHeaders()
        header.Cookie = cookie
        return header
    }
}