const assert = require('assert')
const Axios = require('axios')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
let should = chai.should()
const { expect } = chai



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
            .get('/api/items')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.be.greaterThan(0)
                expect(res.body[0]).to.have.property('id')
                done()
            })
    })

    it('GET unExistent item /api/item/0', (done) => {
        chai.request(app)
            .get('/api/item/0')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('Non existing item')
                done()
            })
    })

    it('GET on existent item /api/item/:id', (done) => {
        chai.request(app)
            .get('/api/items')
            .end((err, res) => {
                let id = res.body[0].id
                chai.request(app)
                    .get(`/api/item/${id}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.body).to.have.property('title')
                        done()
                    })
            })
    })

    it('GET on nonExisting route', (done) => {
        chai.request(app)
            .get('/api/nothing')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('unknown route')
                done()
            })
    })

    it('GET without being identified', (done) => {
        chai.request(app)
            .get('/user')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('You are not authenticated, Please login !')
                done()
            })
    })


})
