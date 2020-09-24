const assert = require('assert')
const Axios = require('axios')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
let should = chai.should()
const { expect } = chai
const FormData = require('form-data')
const path = require('path')
const fs = require('fs')
const chaiFiles = require('chai-files')

const BASE_URL = 'http://localhost:4444'

const credentials = {
    name: 'root',
    password: '123456'
}

chai.use(chaiHttp)
chai.use(chaiFiles)

let getNewFormData = (
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
) => {
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


function getHeaderWithCookie(formData, cookie) {
    let header = formData.getHeaders()
    header.Cookie = cookie
    return header
}



describe('testing add delete update item', () => {
    before(async () => {
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        let cookie = resLog.headers['set-cookie']
        const resDel = await Axios.get(`${BASE_URL}/admin/delete_test_file_uploads`, { headers: { Cookie: cookie } })
        console.log('deleted test database')
    })


    it('UPDATE item at POST /admin/updateitem', async function () {
        // this.timeout(5000)
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('files', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('files', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('files', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('files', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        console.log('check id', resAdd.data, insertedId)
        const resGetAfter = await Axios.get(`${BASE_URL}/api/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(3)
        console.log('result img', imgMainBefore, imgOthersBefore)
        const updateFormData = getNewFormData(title = "Updated title", subtitle = "Updated subtitle")
        updateFormData.append('id', insertedId)
        const resUpdate = await Axios.post(`${BASE_URL}/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        const resCheck = await Axios.get(`${BASE_URL}/api/item/${insertedId}`)
        expect(resCheck).to.have.status(200)
        expect(resCheck.data.id).to.be.equal(insertedId)
        expect(resCheck.data.title).to.be.equal('Updated title')
        expect(resCheck.data.subtitle).to.be.equal('Updated subtitle')
        expect(resCheck.data.img_main).to.be.equal(imgMainBefore)
        expect(resCheck.data.img_others).to.be.equal(imgOthersBefore)
        //make another test to test just if the pictures are changed
        console.log(resCheck.data)

    })

    it('UPDATE only img_Main at /admin/updateitem', async function () {
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('files', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('files', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let itemBefore = resGetAfter.data
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(1)
        const updateFormData = getNewFormData()
        updateFormData.append('id', insertedId)
        updateFormData.append('file_main', fs.createReadStream('./test/placeholder.png'))
        const resUpdate = await Axios.post(`${BASE_URL}/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        expect(resUpdate).to.have.status(200)
        expect(resUpdate.data.status).to.be.equal('success')
        const resGetUpdated = await Axios.get(`${BASE_URL}/api/item/${insertedId}`)
        expect(resGetUpdated).to.have.status(200)
        expect(resGetUpdated.data.title).to.be.equal(itemBefore.title)
        expect(resGetUpdated.data.img_others).to.be.equal(itemBefore.img_others)
        expect(resGetUpdated.data.img_main).to.be.not.equal(itemBefore.img_main)
    })

})
