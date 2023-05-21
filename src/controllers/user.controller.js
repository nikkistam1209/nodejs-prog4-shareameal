const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const userController = {

  // UC-201 create new user
  createUser:((req, res, next) => {
    logger.info('register user')
    const user = req.body;
    logger.debug('user = ', user)

    try {
        // validation: fields must be valid and filled out
        assert(typeof user.firstName === 'string' && user.firstName.trim().length > 0 , 'firstName must be a string')
        assert(typeof user.lastName === 'string' && user.lastName.trim().length > 0 , 'lastName must be a string')
        assert(typeof user.roles === 'string' && user.roles.trim().length > 0 , 'roles must be a string')
        assert(typeof user.street === 'string' && user.street.trim().length > 0 , 'street must be a string')
        assert(typeof user.city === 'string' && user.city.trim().length > 0 , 'city must be a string')

        // email address validation
        assert(typeof user.emailAdress === 'string' && user.emailAdress.trim().length > 0, 'emailAdress must be a string')
        // assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.emailAdress), 'emailAdress is not valid') // oude email validatie
        assert(/^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(user.emailAdress), 'emailAdress is not valid');

        // password validation
        assert(typeof user.password === 'string' && user.password.trim().length > 0, 'password must be a string')
        assert(user.password.length >= 8, 'password must be at least 8 characters long')
        assert(/[A-Z]/.test(user.password), 'password must contain at least one uppercase letter')
        assert(/[0-9]/.test(user.password), 'password must contain at least one number')
        //assert(/[^a-z0-9]/i.test(user.password), 'password must contain at least one special character') hoeft niet

        // phoneNumber validation
        assert(typeof user.phoneNumber === 'string' && user.phoneNumber.trim().length > 0 , 'phoneNumber must be a string')
        assert(/^06[- ]?\d{8}$/.test(user.phoneNumber), 'phoneNumber is not valid');

        pool.query('SELECT * FROM `user` WHERE `emailAdress` = ?', [user.emailAdress], (err, result) => {
            if (err) {
                logger.error(err.message);
                res.status(500).json({ 
                    status: 500, 
                    message: 'Failed to search for emailAdress in the database' 
                });
                return;
            }   
            try {
                assert(result.length === 0, 'emailAdress already exists in the database')
                const sqlStatement = 'INSERT INTO `user` SET ?'
                pool.getConnection((err, conn) => {
                    if (err) {
                        logger.error(err.message);
                        res.status(500).json({ 
                            status: 500, 
                            message: 'Failed to connect to the database' 
                        });
                        return;
                    }
                    conn.query(sqlStatement, user, (err, result) => {
                        if (err) {
                            logger.error(err.message);
                            res.status(500).json({ 
                                status: 500, 
                                message: 'Failed to insert user data into the database' 
                            });
                            return;
                        }
                        user.id = result.insertId;
                        logger.info('User registered successfully with ID:', result.insertId)
                        res.status(201).json({ 
                            status: 201, 
                            message: 'Successfully registered user', 
                            data: user 
                        });
                    })
                    pool.releaseConnection(conn);
                });
            } catch (err) {
                logger.warn(err.message)
                res.status(403).json({
                    status: 403,
                    message: err.message, // this is the assert message: the user/email already exists
                    data: undefined
                });
                return;
            }
        });
    } catch (err) {
        logger.warn(err.message)
        res.status(400).json({
            status: 400,
            message: err.message, // this is the assert message
            data: undefined
        });
        return;
    }
  }),

  // UC-202 request all users
  getAllUsers:((req, res, next) => {
    logger.info('get all users')
    
    const queryField = Object.entries(req.query)
    let sqlStatement = '';
    let sqlParams = [];

    if (queryField.length === 2) {
        logger.info(`Queryfield 1 ${queryField[0][0]} = ${queryField[0][1]}`)
        logger.info(`Queryfield 2 ${queryField[1][0]} = ${queryField[1][1]}`)
        sqlStatement = `SELECT * FROM \`user\` WHERE ${queryField[0][0]} = ? AND ${queryField[1][0]} = ?`;
        sqlParams = [queryField[0][1], queryField[1][1]];
    } else if (queryField.length === 1) {
        logger.info(`Queryfield 1 ${queryField[0][0]} = ${queryField[0][1]}`)
        sqlStatement = `SELECT * FROM \`user\` WHERE ${queryField[0][0]} = ?`;
        sqlParams = [queryField[0][1]];
    } else {
        sqlStatement = 'SELECT * FROM `user`';
    }

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.message);
        next({
          status: 500,
          message: 'Failed to connect to the database',
        });
      }
      if (conn) {
        conn.query(sqlStatement, sqlParams, function (err, results, fields) {
          if (err) {
            logger.error(err.message);
            next({
              status: 500,
              message: 'Failed to retrieve user data',
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            const userId = req.userId; // Retrieve the user ID from the token payload

            const secureResults = results.map((result) => {
              if (result.id === userId) {
                return result; // Include password for the user specified by the token payload
              } else {
                const { password, ...userInfo } = result;
                return userInfo; // Exclude password for other users
              }
            });

            res.status(200).json({
              status: 200,
              message: 'User data endpoint',
              data: secureResults,
            });


          }
        });
        pool.releaseConnection(conn);
      }
    });


  }),

  // UC-203 request profile
  getUserProfile:((req, res, next) => {

    sqlStatementUser = 'SELECT * FROM `user` WHERE id = ?';
    sqlStatementMeal = 'SELECT * FROM `meal` WHERE cookId = ?';
    const userId = req.userId;

    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          status: 500,
          message: 'Failed to connect to the database',
        });
      }
      if (conn) {
        conn.query(sqlStatementUser, userId, function (err, userResults, fields) {
          if (err) {
            logger.error(err.message);
            res.status(500).json({
              status: 500,
              message: 'Failed to retrieve user data',
            });
          }
          if (userResults.length > 0) {
            logger.info('Found', userResults.length, 'user results');
            
            conn.query(sqlStatementMeal, userId, function (err, mealResults, field) {
              if (err) {
                logger.error(err.message)
                res.status(500).json({
                  status: 500,
                  message: 'Failed to retrieve meal data',
                });
              }
              if (mealResults.length > 0) {
                logger.info('Found', mealResults.length, 'meal results');

                res.status(200).json({
                  status: 200,
                  message: 'User data endpoint',
                  data: { 
                    user: userResults, 
                    meals: mealResults
                  }
                });

              }
              else {
                res.status(200).json({
                  status: 200,
                  message: 'User data endpoint',
                  data: { 
                    user: userResults
                  }
                });
              }
            })
            
            


          }
        });
        pool.releaseConnection(conn);
      }
    });


  }),

  // UC-204 request user by id
  getUserById:((req, res, next) => {
    logger.info('get user by id');
  
    const id = req.params.userId;
    const userId = req.userId; // Retrieve the user ID from the token payload
    logger.debug('id = ' , id, 'userId = ', userId)
  
    const sqlStatementUser = 'SELECT * FROM `user` WHERE id = ?';
    const sqlStatementMeal = 'SELECT * FROM `meal` WHERE cookId = ?';
  
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error(err.message);
        next({
          status: 500,
          message: 'Failed to connect to the database'
        });
        return;
      }
      conn.query(sqlStatementUser, id, (err, userResult) => {
        if (err) {
          logger.error(err.message);
          res.status(500).json({
            status: 500,
            message: 'Failed to retrieve user data from the database'
          });
          return;
        }
        if (userResult.length === 0) {
          res.status(404).json({
            status: 404,
            message: 'Unable to find user',
            data: undefined
          });
          return;
        }

        const user = userResult[0];
        logger.info('User found:', user);

        const secureResults = userResult.map((result) => {
          if (result.id === userId) {
            return result; // Include password for the user specified by the token payload
          } else {
            const { password, ...userInfo } = result;
            return userInfo; // Exclude password for other users
          }
        });

        conn.query(sqlStatementMeal, id, (err, mealResult) => {
          if (err) {
            logger.error(err.message);
            res.status(500).json({
              status: 500,
              message: 'Failed to retrieve user data from the database'
            });
          } 
          if (mealResult.length > 0){
            logger.info('Found', mealResult.length, 'meal results');

            res.status(200).json({
              status: 200,
              message: 'User data endpoint',
              data: { 
                user: secureResults, 
                meals: mealResult
              }
            });

          } else {
            logger.info('Found', mealResult.length, 'meal results');

            res.status(200).json({
              status: 200,
              message: 'User data endpoint',
              data: { 
                user: secureResults
              }
            });
          }
        })

      });
      pool.releaseConnection(conn);
    });
  }),
  
  // UC-205 update user
  updateUser:((req, res, next) => {
    logger.info('update user');
  
    const id = req.params.userId;
    const compId = Number(id); // Convert id from string to number
  
    const userIdFromToken = req.userId;
    const updatedUser = req.body;
    logger.debug('updatedUser = ', updatedUser, id, userIdFromToken);
  
    logger.debug('userIdFromToken = ', userIdFromToken, typeof userIdFromToken);
    logger.debug('id = ', id, typeof id);
    logger.debug('compId = ', compId, typeof compId);
  
    const sqlStatement = 'SELECT * FROM `user` WHERE `id` = ?';
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error(err.message);
        next({
          status: 500,
          message: 'Failed to connect to the database',
        });
        return;
      }
      conn.query(sqlStatement, [id], (err, result) => {
        if (err) {
          logger.error(err.message);
          next({
            status: 500,
            message: 'Failed to search for user data in the database',
          });
          return;
        }
        if (result.length === 0) {
          logger.warn('No user found with ID:', id);
          res.status(404).json({
            status: 404,
            message: `User with ID ${id} not found`,
            data: undefined
          });
          return;
        }
        const user = result[0];
  
        // Check if userId from token matches req.params.userId
        if (userIdFromToken !== compId) {
          logger.info('Not authorized');
          res.status(403).json({
            status: 403,
            message: 'Not authorized to update this user',
            data: undefined
          });
          return;
        }
  
        if (!updatedUser.emailAdress) {
          res.status(400).json({
            status: 400,
            message: 'emailAdress is required',
            data: undefined
          });
          return;
        }
  
        try {
          // Email validation
          assert(typeof updatedUser.emailAdress === 'string' && updatedUser.emailAdress.trim().length > 0, 'emailAdress must be a string');
          assert(/^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(updatedUser.emailAdress), 'emailAdress is not valid');
  
          // Password validation
          if (updatedUser.password) {
            assert(typeof updatedUser.password === 'string' && updatedUser.password.trim().length > 0, 'password must be a non-empty string');
            assert(updatedUser.password.length >= 8, 'password must be at least 8 characters long');
            assert(/[A-Z]/.test(updatedUser.password), 'password must contain at least one uppercase letter');
            assert(/[0-9]/.test(updatedUser.password), 'password must contain at least one number');
          }
  
          // PhoneNumber validation
          if (updatedUser.phoneNumber) {
            assert(typeof updatedUser.phoneNumber === 'string' && updatedUser.phoneNumber.trim().length > 0, 'phoneNumber must be a non-empty string');
            assert(/^06[- ]?\d{8}$/.test(updatedUser.phoneNumber), 'phoneNumber is not valid');
          }
  
          const updateFields = { ...user, ...updatedUser };


          const updateSqlStatement = 'UPDATE `user` SET ? WHERE `id` = ?';
          conn.query(updateSqlStatement, [updateFields, id], (err, result) => {
            if (err) {
              logger.error(err.message);
              next({
                status: 500,
                message: 'Failed to update user data in the database',
              });
              return;
            }
            logger.info('User updated successfully with ID:', id);
            res.status(200).json({
              status: 200,
              message: `Successfully updated user with ID ${id}`,
              data: { id, ...updateFields },
            });
          });


        } catch (err) {
          logger.warn(err.message);
          res.status(400).json({
            status: 400,
            message: err.message, // This is the assert message
            data: undefined
          });
          return;
        }
      });
      pool.releaseConnection(conn);
    });
  }),
  
  // UC-206 delete user
  deleteUser:((req, res, next) => {
    logger.info('delete user');

    const userIdFromToken = req.userId;
    const userId = parseInt(req.params.userId);

    const searchUserSql = 'SELECT * FROM `user` WHERE id = ?';
    const deleteUserSql = 'DELETE FROM `user` WHERE id = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({
                status: 500,
                message: 'Failed to connect to the database',
            });
            return;
        }

        // Search for the user
        conn.query(searchUserSql, [userId], (err, results) => {
            if (err) {
                logger.error(err.message);
                next({
                    status: 500,
                    message: 'Failed to retrieve user data from the database',
                });
                return;
            }

            if (results.length === 0) {
                logger.info(`Unable to find user with ID ${userId}`);
                res.status(404).json({
                    status: 404,
                    message: `Unable to find user with ID ${userId}`,
                    data: undefined
                });
                return;
            }

            const user = results[0];

            if (userIdFromToken !== userId) {
                logger.info('Not authorized to delete this user');
                res.status(403).json({
                    status: 403,
                    message: 'Not authorized to delete this user',
                    data: undefined
                });
                return;
            }

            // Delete meals??

            // Delete the user
            conn.query(deleteUserSql, [userId], (err, result) => {
                if (err) {
                    logger.error(err.message);
                    next({
                        status: 500,
                        message: 'Failed to delete user data from the database',
                    });
                    return;
                }

                logger.info(`Successfully deleted user with ID ${userId}`);
                res.status(200).json({
                    status: 200,
                    message: `Successfully deleted user with ID ${userId}`,
                    data: undefined,
                });
            });
        });

        pool.releaseConnection(conn);
    });
  })

  
}
  
module.exports = userController
  