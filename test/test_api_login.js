const assert = require('assert')
const Axios = require('axios')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../server')
let should = chai.should()
const { expect } = chai

// testing login requests

const baseURL = 'https://mroze-printings.com'

chai.use(chaiHttp)

describe('test LOGIN without credits', () => {
    it('GET at /admin', (done) => {
        chai.request(app)
            .get('/api/v1/admin')
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
            .post('/api/v1/login/?name=root&password=123456')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('root')
                done()
            })
    })

    it('POST at /login with axios', (done) => {
        Axios.post(`${baseURL}/api/v1/login`, { name: 'root', password: '123456' })
            .then(res => {
                expect(res).to.have.status(200)
                expect(res.data).to.be.equal('root')
                done()
            })
            .catch(err => done(err))

    })
})

describe('test LOGIN with credits and admin after', () => {
    it('POST at /login', (done) => {
        let agent = chai.request.agent(app)
        agent
            .post('/api/v1/login/?name=root&password=123456')
            .end((err, res) => {
                agent
                    .get('/api/v1/admin')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.text).to.be.equal('Welcome root')
                        agent.close()
                        done()
                    })
            })
    })

    it('POST at /login with axios', done => {
        Axios.post(`${baseURL}/api/v1/login`, { name: 'root', password: '123456' })
            .then(res => {
                let cookie = res.headers['set-cookie']
                Axios.get(`${baseURL}/api/v1/admin`, {
                    headers: {
                        Cookie: cookie
                    }
                }).then(res => {
                    expect(res).to.have.status(200)
                    expect(res.data).to.be.equal('Welcome root')
                    done()
                }).catch(err => done(err))
            }).catch(err => done(err))
    })
})

describe('test LOGOUT after Login', () => {
    it('POST at /login', (done) => {
        let agent = chai.request.agent(app)
        agent
            .post('/api/v1/login/?name=root&password=123456')
            .end((err, res) => {
                agent
                    .get('/api/v1/admin')
                    .end((err, res) => {
                        expect(res).to.have.status(200)
                        expect(res.text).to.be.equal('Welcome root')
                        agent
                            .get('/api/v1/logout')
                            .end((err, res) => {
                                agent
                                    .get('/api/v1/admin')
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
            .post('/api/v1/login/?name=root&password=notCorrect')
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
            .post('/api/v1/login/?name=notCorrect&password=notCorrect')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.text).to.be.equal('username or password incorrect !')
                done()
            })
    })
})


