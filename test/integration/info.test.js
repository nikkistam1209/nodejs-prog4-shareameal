const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
chai.should()
chai.use(chaiHttp)



describe('Server-info', function() {
	it('TC-102 - Server info should return succesful information', (done) => {
		chai.request(server)
		.get('/api/info')
		.end((err,res)=>{
            res.body.should.be.an('object')
            res.body.should.has.property('status').to.be.equal(201)
            res.body.should.has.property('message')
            res.body.should.has.property('data')
            let { data, message } = res.body
            data.should.be.an('object')
            data.should.has.property('studentName').to.be.equal('Nikki')
            data.should.has.property('studentNumber').to.be.equal(2145898)
            done()
		})
	});

    it('TC-103 - Server should return valid error when endpoint does not exist', (done) => {
		chai.request(server)
		.get('/api/doesnotexist')
		.end((err,res)=>{
            res.body.should.be.an('object')
            res.body.should.has.property('status').to.be.equal(404)
            res.body.should.has.property('message').to.be.equal('Endpoint not found')
            res.body.should.has.property('data')
            let { data, message } = res.body
            data.should.be.an('object')
            done()
		})
	});
    
})

