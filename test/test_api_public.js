const assert = require('assert')
const Axios = require('axios')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
let should = chai.should()
const { expect } = chai

const BASE_URL = 'https://mroze-printings.com'



chai.use(chaiHttp)

describe('null test', () => {
    describe('should pass', () => {
        it('should pass without error', () => {
            assert.strictEqual(1, 1)
        })
    })
})

describe('testing api routes without need auth', () => {
    it('GET get all items at /api/items', (done) => {
        chai.request(app)
            .get('/api/v1/items')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.be.greaterThan(0)
                expect(res.body[0]).to.have.property('id')
                done()
            })
    })

    it('GET unExistent item /api/item/0', (done) => {
        Axios.get(`${BASE_URL}/api/v1/item/0`)
            .then(res => {
                expect(res).to.have.status(200)
                expect(res.data).to.be.equal('Non existing item')
                done()
            }).catch(err => done(err))
    })

    it('GET on existent item /api/item/:id', (done) => {
        Axios.get(`${BASE_URL}/api/v1/items`)
            .then(res => {
                let id = res.data[0].id
                Axios.get(`${BASE_URL}/api/v1/item/${id}`)
                    .then(res => {
                        expect(res).to.have.status(200)
                        expect(res.data).to.have.property('title')
                        done()
                    }).catch(err => done(err))
            }).catch(err => done(err))
    })

    it('GET on nonExisting route', (done) => {
        chai.request(app)
            .get('/api/v1/nothing')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('unknown route /api/v1/nothing')
                done()
            })
    })

    it('GET without being identified', (done) => {
        chai.request(app)
            .get('/api/v1/user')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('You are not authenticated, Please login !')
                done()
            })
    })


})
