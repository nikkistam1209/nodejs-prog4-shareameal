const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
chai.should()
chai.use(chaiHttp)

const assert = require('assert')

describe('UC-201', function() {
	it('TC-201-5 - User registered succesfully', (done) => {

        const testUser = {
            firstName: 'Kees', 
            lastName: 'Jansen', 
            emailAddress: 'kees@avans.nl'
        }
		chai.request(server)
		.post('/api/user/register')
        .send(testUser)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object')
            let {status, message, data} = res.body;

            status.should.equal(201)
            message.should.equal('Succesfully registered user')
            data.should.be.an('object')
            data.id.should.equal(3);
            data.firstName.should.equal('Kees');
            data.lastName.should.equal('Jansen');
            done()
		})
	});
})

describe('UC-202', function() {
	it('TC-202-1 - Return all user data', (done) => {
		chai.request(server)
		.get('/api/user')
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message, data} = res.body;

            status.should.equal(200);
            message.should.equal('User data');
            data.should.be.an('array');

            data.forEach(user => {
                user.should.have.property('id');
                user.should.have.property('firstName');
                user.should.have.property('lastName');
                user.should.have.property('emailAddress');
              });

            done();
		})
	});
})

// not implemented
describe('UC-203', function() {
	it.skip('TC-203-2 - User succesfully logged in', (done) => {
		chai.request(server)
		.get('/api/user/profile')
		.end((err,res)=>{
            //
            done()
		})
	});
})

describe('UC-204', function() {
	it('TC-204-3 - User ID exists', (done) => {
		chai.request(server)
		.get('/api/user/1')
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object')
            let {status, message, data} = res.body;

            status.should.equal(200)
            message.should.equal('User data')
            data.should.be.an('object')
            data.id.should.equal(1);
            data.firstName.should.equal('Nikki');
            data.lastName.should.equal('Stam');
            data.emailAddress.should.equal('nikki.stam@hotmail.com')
            done()
		})
	});
})

describe('UC-206', function() {
	it('TC-206-4 - User succesfully deleted', (done) => {
        const id = 1
		chai.request(server)
		.delete(`/api/user/${id}`)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message} = res.body;

            status.should.equal(200);
            message.should.equal(`Succesfully deleted user with ID ${id}`);

            done();
		})
	});
})