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
    file_main = fs.createReadStream('./test/placeholder.png')
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
    tmpFormData.append('files', file_main)
    return tmpFormData
}





describe('testing add delete update item', () => {
    before(async () => {
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        let cookie = resLog.headers['set-cookie']
        const resDel = await Axios.get(`${BASE_URL}/admin/delete_test_file_uploads`, { headers: { Cookie: cookie } })
        console.log('deleted test database')
    })


    // Creation of new item and check if good insertion in the db
    it('ADD item at /admin/additem', async () => {
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        let cookie = resLog.headers['set-cookie']
        let formDataNewItem = getNewFormData()
        const resAdd = await Axios.post(`${BASE_URL}/admin/additem`, formDataNewItem,
            {
                headers: (function () {
                    let header = formDataNewItem.getHeaders()
                    header.Cookie = cookie
                    return header
                })()
            }
        )
        expect(resAdd).to.have.status(200)
        expect(resAdd.data.status).to.be.equal('success')
        expect(Number.parseInt(resAdd.data.id)).to.be.a('number')
        const id = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/item/${id}`)
        expect(resGetAfter).to.have.status(200)
        const item = resGetAfter.data
        expect(item.title).to.be.equal('AddItem Title')
        // expect(chaiFiles.file(`./uploads_test/${item.img_main}`)).to.exist
    })

    it('DELETE at /admin/deleteitem', async () => {
        // const cookie = getLoginCookie()
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const resGet = await Axios.get(`${BASE_URL}/api/items`)
        const items = resGet.data
        //choose a random item 
        const index = Math.floor(Math.random() * Math.floor(items.length)) // get a random index
        const choosenItem = items[index]
        const resDel = await Axios.delete(`${BASE_URL}/admin/deleteitem/${choosenItem.id}`, {
            params: { itemId: choosenItem.id },
            headers: { Cookie: cookie }
        })
        expect(resDel).to.have.status(200)
        expect(resDel.data.status).to.be.equal('success')
        const resGetAfter = await Axios.get(`${BASE_URL}/api/item/${choosenItem.id}`)
        expect(resGetAfter).to.be.status(200)
        expect(resGetAfter.data).to.be.equal('Non existing item')
    })

    it('try to DELETE item without login', async function () {
        const resGet = await Axios.get(`${BASE_URL}/api/items`)
        const items = resGet.data
        const index = Math.floor(Math.random() * Math.floor(items.length))
        const choosenItem = items[index]
        const resDel = await Axios.delete(`${BASE_URL}/admin/deleteitem/${choosenItem.id}`, { params: { itemId: choosenItem.id } })
        expect(resDel).to.have.status(200)
        expect(resDel.data).to.be.equal('You are not authenticated, Please login !')
    })

    it('UPDATE item at POST /admin/updateitem', async function () {
        // this.timeout(5000)
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        const resAdd = await Axios.post(`${BASE_URL}/admin/additem`, tmpAdd, {
            headers: (function () {
                let header = tmpAdd.getHeaders()
                header.Cookie = cookie
                return header
            })()
        })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const updateFormData = getNewFormData(title = "Updated title", subtitle = "Updated subtitle")
        updateFormData.append('id', insertedId)
        updateFormData.append('files', fs.createReadStream('./test/placeholder.png'))
        console.log('formdata', updateFormData)
        const resUpdate = await Axios.post(`${BASE_URL}/admin/updateitem`, updateFormData, {
            headers: (function () {
                let header = updateFormData.getHeaders()
                header.Cookie = cookie
                return header
            })()
        })
        const resCheck = await Axios.get(`${BASE_URL}/api/item/${insertedId}`)
        expect(resCheck).to.have.status(200)
        expect(resCheck.data.title).to.be.equal('Updated title')
        expect(resCheck.data.subtitle).to.be.equal('Updated subtitle')
        //should check taht the img are the same
        //make another test to test just if the pictures are changed
        console.log(resCheck.data)

    })
})

