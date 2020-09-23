const assert = require('assert')
const Axios = require('axios')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
let should = chai.should()
const { expect } = chai

// testing login requests


chai.use(chaiHttp)

describe('test LOGIN without credits', () => {
    it('GET at /admin', (done) => {
        chai.request(app)
            .get('/admin')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('You are not authenticated, Please login !')
                done()
            })
    })
})

describe('test LOGIN with credits', () => {
    it('POST at /login', (done) => {
        chai.request(app)
            .post('/login/?name=root&password=123456')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('root')
                done()
            })
    })
})

describe('test LOGIN with credits and admin after', () => {
    it('POST at /login', (done) => {
        let agent = chai.request.agent(app)
        agent
            .post('/login/?name=root&password=123456')
            .end((err, res) => {
                agent
                    .get('/admin')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.text).to.be.equal('Welcome root')
                        agent.close()
                        done()
                    })
            })
    })
})
describe('test LOGOUT after Login', () => {
    it('POST at /login', (done) => {
        let agent = chai.request.agent(app)
        agent
            .post('/login/?name=root&password=123456')
            .end((err, res) => {
                agent
                    .get('/admin')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.text).to.be.equal('Welcome root')
                        agent
                            .get('/logout')
                            .end((err, res) => {
                                agent
                                    .get('/admin')
                                    .end((err, res) => {
                                        expect(res).to.have.status(200)
                                        expect(res.text).to.be.equal('You are not authenticated, Please login !')
                                        agent.close()
                                        done()
                                    })
                            })
                    })
            })
    })
})

describe('test LOGIN with incorrect credits', () => {
    it('POST at /login with incorrect pass', (done) => {
        chai.request(app)
            .post('/login/?name=root&password=notCorrect')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('username or password incorrect !')
                done()
            })
    })
})

describe('test LOGIN with incorrect credits', () => {
    it('POST at /login with incorrect pass', (done) => {
        chai.request(app)
            .post('/login/?name=notCorrect&password=notCorrect')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('username or password incorrect !')
                done()
            })
    })
})


