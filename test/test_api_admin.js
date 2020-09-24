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
let formDataNewItem = getNewFormData()





describe('testing add delete update item', () => {
    before(async () => {
        const resLog = await Axios.post(`${BASE_URL}/login`, credentials)
        let cookie = resLog.headers['set-cookie']
        const resDel = await Axios.get(`${BASE_URL}/admin/delete_test_file_uploads`, { headers: { Cookie: cookie } })
        console.log('deleted test database')

    })


    // Creation of new item and check if good insertion in the db
    it('POST at /admin/additem', done => {
        let headers = formDataNewItem.getHeaders()
        Axios.post(`${BASE_URL}/login`, credentials)
            .then(res => {
                let cookie = res.headers['set-cookie']
                headers.Cookie = cookie
                Axios.post(`${BASE_URL}/admin/additem`,
                    formDataNewItem,
                    { headers: headers }
                ).then(res => {
                    expect(res).to.have.status(200)
                    expect(res.data.status).to.be.equal('success')
                    expect(Number.parseInt(res.data.id)).to.be.a('number')
                    const id = res.data.id
                    Axios.get(`${BASE_URL}/api/item/${id}`)
                        .then(res => {
                            expect(res).to.have.status(200)
                            const item = res.data
                            expect(item.title).to.be.equal('AddItem Title')
                            expect(chaiFiles.file(`./uploads_test/${item.img_main}`)).to.exist
                            done()
                        }).catch(err => done(err))
                }).catch(err => done(err))
            }).catch(err => done(err))
    })

    it('DELETE at /admin/deleteitem', done => {
        // const cookie = getLoginCookie()
        Axios.post(`${BASE_URL}/login`, credentials)
            .then(res => {
                const cookie = res.headers['set-cookie']
                Axios.get(`${BASE_URL}/api/items`)
                    .then(res => {
                        const items = res.data
                        //choose a random item 
                        const index = Math.floor(Math.random() * Math.floor(items.length)) // get a random index
                        const choosenItem = items[index]
                        Axios.delete(`${BASE_URL}/admin/deleteitem/${choosenItem.id}`, {
                            params: { itemId: choosenItem.id },
                            headers: { Cookie: cookie }
                        }).then(res => {
                            expect(res).to.have.status(200)
                            expect(res.data.status).to.be.equal('success')
                            Axios.get(`${BASE_URL}/api/item/${choosenItem.id}`)
                                .then(res => {
                                    expect(res).to.be.status(200)
                                    expect(res.data).to.be.equal('Non existing item')
                                    done()
                                })
                        })
                    }).catch(err => done(err))
            })
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

    it('modify item at POST /admin/updateitem', async function () {
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
        const updateFormData = getNewFormData(title = "Updated title")
        updateFormData.append('id', insertedId)
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

    })
})

