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

Axios.defaults.withCredentials = true


const userName = 'root'
const password = '123456'
chai.use(chaiHttp)

let formDataNewItem = new FormData()
formDataNewItem.append('title', 'AddItem Title')
formDataNewItem.append('subtitle', 'AddItem SubTitle')
formDataNewItem.append('description_1', 'AddItem Description_1')
formDataNewItem.append('description_2', 'AddItem Description_1')
formDataNewItem.append('material', 'AddItem Material')
formDataNewItem.append('size', 'AddItem Size')
formDataNewItem.append('devise', 'AddItem Device')
formDataNewItem.append('viewable', 'true')
formDataNewItem.append('price', '300')
formDataNewItem.append('sold', 'true')
formDataNewItem.append('promotion', 'AddItem Promotion')
formDataNewItem.append('files', fs.createReadStream('./test/placeholder.png'))
// formDataNewItem.append('user', 'root')
// formDataNewItem.append('password', '123456')



// describe('testing /admin route', () => {
//     it('GET at /admin to check if we are admin', done => {
//         let agent = chai.request.agent(app)
//         agent
//             .post(`/login/?name=${userName}&password=${password}`)
//             .end((err, res) => {
//                 agent
//                     .get(`/admin`)
//                     .end((err, res) => {
//                         expect(res).to.have.status(200)
//                         expect(res.text).to.be.equal(`Welcome ${userName}`)
//                         agent.close()
//                         done()
//                     }),
//             })
//     })
// })

// describe('testing add an item', () => {
//     it('POST at /admin/additem', done => {
//         let agent = chai.request.agent(app)
//         agent
//             .post(`/login/?name=${userName}&password=${password}`)
//             .end((err, res) => {
//                 agent
//                     .post(`/admin/additem`)
//                     .set('Content-type', 'application/x-www-form-urlencoded')
//                     .send({ data: formDataNewItem })
//                     .end((err, res) => {
//                         console.log(res)
//                         expect(res).to.have.status(200)

//                         agent.close()
//                         done()
//                     })
//             })
//     })
// })

describe('testing add an item', () => {
    before(() => {
        console.log('beforrrrrrre')
        Axios.post('http://localhost:4444/login', { name: 'root', password: '123456' })
            .then(res => {
                console.log('inbefore', res.data)
                let cookie = res.headers['set-cookie']
                Axios.get('http://localhost:4444/admin/delete_test_file_uploads', {
                    headers: { Cookie: cookie }
                }).then(res => console.log(res.data))
                    .catch(err => console.log(err))
            })

    })

    it('POST at /admin/additem', done => {
        let headers = formDataNewItem.getHeaders()

        Axios.post('http://localhost:4444/login', { name: 'root', password: '123456' })
            .then(res => {
                let cookie = res.headers['set-cookie']
                headers.Cookie = cookie
                Axios({
                    method: "POST",
                    data: formDataNewItem,
                    url: 'http://localhost:4444/admin/additem',
                    headers: headers,
                }).then(res => {
                    expect(res).to.have.status(200)
                    expect(res.data.status).to.be.equal('success')
                    expect(Number.parseInt(res.data.id)).to.be.a('number')
                    done()
                }).catch(err => done(err))

            })
    })
})

