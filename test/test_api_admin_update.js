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
const { getNewFormData, getHeaderWithCookie } = require('./helpers/functions')

const BASE_URL = process.env.API_TEST_URL
const credentials = {
    name: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PASSWORD
}

chai.use(chaiHttp)
chai.use(chaiFiles)

describe('testing update items', () => {
    before(async () => {
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        let cookie = resLog.headers['set-cookie']
        const resDel = await Axios.get(`${BASE_URL}/api/v1/admin/delete_test_file_uploads`, { headers: { Cookie: cookie } })
        console.log('deleted test database')
    })


    it('UPDATE title and subtitle at POST /admin/updateitem', async function () {
        // this.timeout(5000)
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('file_main', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/api/v1/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        expect(resAdd.data.status).to.be.equal('success')
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(3)
        const updateFormData = getNewFormData(title = "Updated title", subtitle = "Updated subtitle")
        updateFormData.append('id', insertedId)
        const resUpdate = await Axios.post(`${BASE_URL}/api/v1/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        const resCheck = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resCheck).to.have.status(200)
        expect(resCheck.data.id).to.be.equal(insertedId)
        expect(resCheck.data.title).to.be.equal('Updated title')
        expect(resCheck.data.subtitle).to.be.equal('Updated subtitle')
        expect(resCheck.data.img_main).to.be.equal(imgMainBefore)
        expect(resCheck.data.img_others).to.be.equal(imgOthersBefore)

    })

    it('UPDATE only img_Main at /admin/updateitem', async function () {
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('file_main', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/api/v1/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let itemBefore = resGetAfter.data
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(1)
        const updateFormData = getNewFormData()
        updateFormData.append('id', insertedId)
        updateFormData.append('file_main', fs.createReadStream('./test/placeholder.png'))
        const resUpdate = await Axios.post(`${BASE_URL}/api/v1/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        expect(resUpdate).to.have.status(200)
        expect(resUpdate.data.status).to.be.equal('success')
        expect(resUpdate.data.removedElementMain.length).to.be.equal(1)
        expect(chaiFiles.file(`./uploads_test/${imgMainBefore}`)).to.not.exist
        const resGetUpdated = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetUpdated).to.have.status(200)
        expect(resGetUpdated.data.title).to.be.equal(itemBefore.title)
        expect(resGetUpdated.data.img_others).to.be.equal(itemBefore.img_others)
        expect(resGetUpdated.data.img_main).to.be.not.equal(itemBefore.img_main)
    })


    it('UPDATE only add img_others at /admin/updateitem', async function () {
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('file_main', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/api/v1/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let itemBefore = resGetAfter.data
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(3)
        const updateFormData = getNewFormData()
        updateFormData.append('id', insertedId)
        updateFormData.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resUpdate = await Axios.post(`${BASE_URL}/api/v1/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        expect(resUpdate).to.have.status(200)
        expect(resUpdate.data.status).to.be.equal('success')
        const resGetUpdated = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetUpdated).to.have.status(200)
        expect(resGetUpdated.data.title).to.be.equal(itemBefore.title)
        expect(resGetUpdated.data.img_main).to.be.equal(itemBefore.img_main)
        expect(resGetUpdated.data.img_others).to.be.not.equal(itemBefore.img_others)
        expect(JSON.parse(resGetUpdated.data.img_others).length).to.be.equal(4)
    })

    it(`UPDATE remove 2 images in img_others at /admin/updateitem`, async function () {
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('file_main', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/api/v1/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let itemBefore = resGetAfter.data
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(3)
        const updateFormData = getNewFormData()
        updateFormData.append('id', insertedId)
        updateFormData.append('removeFile', JSON.parse(imgOthersBefore)[0])
        updateFormData.append('removeFile', JSON.parse(imgOthersBefore)[1])
        const resUpdate = await Axios.post(`${BASE_URL}/api/v1/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        expect(resUpdate).to.have.status(200)
        expect(resUpdate.data.status).to.be.equal('success')
        const resGetUpdated = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetUpdated).to.have.status(200)
        expect(resGetUpdated.data.id).to.be.equal(insertedId)
        expect(resGetUpdated.data.img_main).to.be.equal(itemBefore.img_main)
        expect(resGetUpdated.data.img_others).to.be.not.equal(itemBefore.img_others)
        expect(JSON.parse(resGetUpdated.data.img_others).length).to.be.equal(1)
    })

    it(`UPDATE remove 1 image in img_others at /admin/updateitem`, async function () {
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('file_main', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/api/v1/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let itemBefore = resGetAfter.data
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(3)
        const updateFormData = getNewFormData()
        updateFormData.append('id', insertedId)
        updateFormData.append('removeFile', JSON.parse(imgOthersBefore)[1])
        const resUpdate = await Axios.post(`${BASE_URL}/api/v1/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        expect(resUpdate).to.have.status(200)
        expect(resUpdate.data.status).to.be.equal('success')
        const resGetUpdated = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetUpdated).to.have.status(200)
        expect(resGetUpdated.data.id).to.be.equal(insertedId)
        expect(resGetUpdated.data.img_main).to.be.equal(itemBefore.img_main)
        expect(resGetUpdated.data.img_others).to.be.not.equal(itemBefore.img_others)
        expect(JSON.parse(resGetUpdated.data.img_others).length).to.be.equal(2)
    })

    it(`UPDATE remove all images in img_others and at /admin/updateitem`, async function () {
        const resLog = await Axios.post(`${BASE_URL}/api/v1/login`, credentials)
        const cookie = resLog.headers['set-cookie']
        const tmpAdd = getNewFormData()
        tmpAdd.append('file_main', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        tmpAdd.append('file_others', fs.createReadStream('./test/placeholder.png'))
        const resAdd = await Axios.post(`${BASE_URL}/api/v1/admin/additem`, tmpAdd, { headers: getHeaderWithCookie(tmpAdd, cookie) })
        expect(resAdd).to.have.status(200)
        const insertedId = resAdd.data.id
        const resGetAfter = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetAfter).to.have.status(200)
        let itemBefore = resGetAfter.data
        let imgMainBefore = resGetAfter.data.img_main
        let imgOthersBefore = resGetAfter.data.img_others
        expect(JSON.parse(imgOthersBefore).length).to.be.equal(3)
        const updateFormData = getNewFormData()
        updateFormData.append('id', insertedId)
        updateFormData.append('removeFile', JSON.parse(imgOthersBefore)[0])
        updateFormData.append('removeFile', JSON.parse(imgOthersBefore)[1])
        updateFormData.append('removeFile', JSON.parse(imgOthersBefore)[2])
        const resUpdate = await Axios.post(`${BASE_URL}/api/v1/admin/updateitem`, updateFormData, { headers: getHeaderWithCookie(updateFormData, cookie) })
        expect(resUpdate).to.have.status(200)
        expect(resUpdate.data.status).to.be.equal('success')
        expect(resUpdate.data.removedElementsOthers.length).to.be.equal(3)
        const removedElements = resUpdate.data.removedElementsOthers
        expect(chaiFiles.file(`./uploads_test/${removedElements[0]}`)).to.not.exist
        expect(chaiFiles.file(`./uploads_test/${removedElements[1]}`)).to.not.exist
        expect(chaiFiles.file(`./uploads_test/${removedElements[2]}`)).to.not.exist

        const resGetUpdated = await Axios.get(`${BASE_URL}/api/v1/item/${insertedId}`)
        expect(resGetUpdated).to.have.status(200)
        expect(resGetUpdated.data.id).to.be.equal(insertedId)
        expect(resGetUpdated.data.img_main).to.be.equal(itemBefore.img_main)
        expect(resGetUpdated.data.img_others).to.be.not.equal(itemBefore.img_others)
        expect(JSON.parse(resGetUpdated.data.img_others).length).to.be.equal(0)

    })

})
