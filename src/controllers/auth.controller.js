const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {

    // UC-101 login
    login(req, res, next) {
      logger.trace('login called');

      try { 
        // emailAdress and password are correct format and present in the request
        assert(typeof req.body.emailAdress === 'string' && req.body.emailAdress.trim().length > 0 , 'emailAdress must be a string')
        assert(typeof req.body.password === 'string' && req.body.password.trim().length > 0 , 'password must be a string')

        pool.getConnection((err, connection) => {
            if (err) {
            logger.error('Failed to connect to the database');
            res.status(500).json({
                status: 500,
                message: 'Failed to connect to the database'
            });
            }
            if (connection) {
            logger.trace('Database connection success');
    
            const sqlStatement = 'SELECT * FROM `user` WHERE `emailAdress` =?';
    
            connection.query(sqlStatement, [req.body.emailAdress], function (err, results, fields) {
                if (err) {
                logger.err(err.message);
                res.status(409).json({
                    status: 409,
                    message: err.message
                });
                }
                if (results) {
                logger.info('Found', results.length, 'results');
                if (results.length === 1 && results[0].password === req.body.password) {
    
                    const {password, id, ...userInfo} = results[0];
                    const payload = {
                    userId: id
                    }
    
                    jwt.sign(payload, 
                    jwtSecretKey, 
                    { expiresIn: '2d' }, 
                    (err, token) => {
                        if (token) {
                        res.status(200).json({
                            status: 200,
                            message: 'User logged in successfully',
                            data: {
                            id,
                            ...userInfo,
                            token
                            }
                        });
                        }
                    })
                } else if (results.length === 0) {
                    res.status(404).json({
                        status: 404,
                        message: 'User not found',
                        data: undefined
                        })
                } else {
                    res.status(400).json({
                    status: 400,
                    message: 'Not authorized',
                    data: undefined
                    })
                }
                }
            });
            pool.releaseConnection(connection);
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message, // assert message
            data: undefined
          });
    }
    },

    validateToken(req, res, next) {
        logger.trace('validateToken called');
      
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          logger.trace('No authorization header');
          res.status(401).json({ 
            status: 401,
            message: 'No authorization header',
            data: undefined
          });
        } else {
          const token = authHeader.substring(7);
          logger.trace('token', token);
      
          jwt.verify(token, jwtSecretKey, (err, payload) => {
            if (err) {
              logger.trace('Not authorized');
              res.status(401).json({
                status: 401,
                message: 'Not authorized',
                data: undefined
              });
            } else {
              // Check if payload contains a valid userId
              if (payload && payload.userId) {
                req.userId = payload.userId;
                next();
              } else {
                logger.trace('Invalid token payload');
                res.status(401).json({
                  status: 401,
                  message: 'Invalid token payload',
                  data: undefined
                });
              }
            }
          });
        }
    }

  };