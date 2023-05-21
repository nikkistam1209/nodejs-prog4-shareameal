const dbconnection = require('../../src/util/mysql-db');

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const {logger, jwtSecretKey} = require('../../src/util/utils')
const assert = require('assert')
chai.should()
chai.use(chaiHttp)
const jwt = require('jsonwebtoken');

// test

let token = ''

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city` ) VALUES' +
'(1, "Nikki", "Stam", "n.stam@server.nl", "Password123", "06-29414389", "Amazone", "Dordrecht"),' + 
'(2, "Naam", "Achternaam", "n.achternaam@server.nl", "Secret01", "0612345678", "Straat", "Stad");'

const INSERT_MEALS =
'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
"(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
"(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1)," +
"(3, 'Meal C', 'description', 'image url', NOW(), 5, 6.50, 2);";

describe('Meal API tests', () => {

    // we use only one hook to set up the database  
    before((done) => {
        //logger.trace('before called');

        dbconnection.getConnection(function (err, connection) {
          if (err) {
            done(err);
            throw err; // no connection
          }
          // Use the connection
          connection.query(
            CLEAR_DB + INSERT_USER + INSERT_MEALS,
            function (error, results, fields) {
              if (error) {
                done(error);
                throw error; // not connected!
              }
              logger.trace('before done');
              // When done with the connection, release it.
              dbconnection.releaseConnection(connection);
              done();
            }
          );
        });

        // token voor gebruiker Nikki aanmaken
        token = jwt.sign({ userId: 1 }, jwtSecretKey, {expiresIn: '2h', });

    });

    // Use case 201 registering a new user
    describe('UC-301 - Create meal', function() {

        it('TC-301-1 - Required field missing', (done) => {

            // no name
            const testMeal = {
                maxAmountOfParticipants: 4,
                price: 6.55,
                imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                description: 'Maaltijd test Nikki',
                dateTime : '2023-06-20T16:30:00.000Z'
            }
            chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send(testMeal)
            .end((err,res)=>{
                assert(err === null);

                res.body.should.be.an('object')
                let {status, message, data} = res.body;

                status.should.equal(400)
                message.should.equal('name must be a string')
                //data.should.be.an('object')

                done()
            })
        });
       
        it('TC-301-2 - Not logged in', (done) => {
            const testMeal = {
                maxAmountOfParticipants: 4,
                price: 6.55,
                imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                name: 'Testpasta Bolognese',
                description: 'Maaltijd test Nikki',
                dateTime : '2023-06-20T16:30:00.000Z'
            }
            chai.request(server)
            .post(`/api/meal`)
            .send(testMeal)
            .end((err,res)=>{
            assert(err === null);

                res.body.should.be.an('object');
                let {status, message, data} = res.body;

                status.should.equal(401);
                message.should.equal(`No authorization header`);

                done();
            })
        });
     
        it('TC-301-3 - Meal created successfully', (done) => {

            const testMeal = {
                maxAmountOfParticipants: 4,
                price: 6.55,
                imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                name: 'Testpasta Bolognese',
                description: 'Maaltijd test Nikki',
                dateTime : '2023-06-20T16:30:00.000Z'
            }
            chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send(testMeal)
            .end((err,res)=>{
                assert(err === null);

                res.body.should.be.an('object')
                let {status, message, data} = res.body;

                status.should.equal(201)
                message.should.equal('Successfully created meal')
                data.should.be.an('object')

                data.maxAmountOfParticipants.should.equal(4);
                data.price.should.equal(6.55);
                data.imageUrl.should.equal('https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg');
                data.name.should.equal('Testpasta Bolognese');
                data.description.should.equal('Maaltijd test Nikki');
                data.dateTime.should.equal('2023-06-20T16:30:00.000Z');

                done()
            })
        });
    })

    describe('UC-303 - Get all meals', function() {

        it('TC-303-1 - Successfully return all meals', (done) => {
            chai.request(server)
            .get('/api/meal')
            .end((err,res)=>{
                assert(err === null);

                res.body.should.be.an('object')
                let {status, message, data} = res.body;

                status.should.equal(200)
                message.should.equal('Meal data endpoint')

                data.should.be.an('array');
                data.length.should.be.above(1);

                data.forEach(meal => {
                meal.should.have.property('id');
                meal.should.have.property('price');
                meal.should.have.property('imageUrl');
                meal.should.have.property('name');
                meal.should.have.property('description');
                meal.should.have.property('dateTime');
                });

                done()
            })
        })
    })

    describe('UC-304 - Get meal by ID', function() {

        it('TC-304-1 - Meal does not exist', (done) => {
            chai.request(server)
            .get('/api/meal/666')

            .end((err,res)=>{
                assert(err === null);

                res.body.should.be.an('object')
                let {status, message, data} = res.body;

                status.should.equal(404)
                message.should.equal('Meal with ID 666 not found')

                //data.should.be.an('array');
                //data.length.should.be.equal(0);

                done()
            })
        })

        it('TC-304-2 - Successfully return meal', (done) => {
            chai.request(server)
            .get('/api/meal/1')

            .end((err,res)=>{
                assert(err === null);

                res.body.should.be.an('object')
                let {status, message, data} = res.body;

                status.should.equal(200)
                message.should.equal('Meal data endpoint')

                data.should.be.an('object');
                // data.length.should.be.equal(1);

                // meal.should.have.property('id');
                // meal.should.have.property('price');
                // meal.should.have.property('imageUrl');
                // meal.should.have.property('name');
                // meal.should.have.property('description');
                // meal.should.have.property('dateTime');

                done()
            })
        })


    })

    describe('UC-305 Delete meal', function() {

        it('TC-305-1 - Not logged in', (done) => {
            chai.request(server)
            .delete(`/api/meal/1`)
            .end((err,res)=>{
            assert(err === null);

                res.body.should.be.an('object');
                let {status, message, data} = res.body;

                status.should.equal(401);
                message.should.equal(`No authorization header`);

                done();
            })
        });

        it('TC-305-2 - Not the owner', (done) => {
            chai.request(server)
            .delete(`/api/meal/3`)
            .set('Authorization', `Bearer ${token}`)
            .end((err,res)=>{
            assert(err === null);

                res.body.should.be.an('object');
                let {status, message, data} = res.body;

                status.should.equal(403);
                message.should.equal(`Not authorized to delete this meal`);

                done();
            })
        });

        it('TC-305-3 - Meal not found', (done) => {
            chai.request(server)
            .delete(`/api/meal/666`)
            .set('Authorization', `Bearer ${token}`)
            .end((err,res)=>{
            assert(err === null);

                res.body.should.be.an('object');
                let {status, message, data} = res.body;

                status.should.equal(404);
                message.should.equal(`Unable to find meal with ID 666`);

                done();
            })
        });

        it('TC-305-4 - Meal not found', (done) => {
            chai.request(server)
            .delete(`/api/meal/1`)
            .set('Authorization', `Bearer ${token}`)
            .end((err,res)=>{
            assert(err === null);

                res.body.should.be.an('object');
                let {status, message, data} = res.body;

                status.should.equal(200);
                message.should.equal(`Successfully deleted meal with ID 1`);


                done();
            })
        });

    })

})