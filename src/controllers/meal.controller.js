const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const mealController = {

  // UC-301 create new meal
  createMeal: ((req, res, next) => {
    logger.info('create meal');
  
    const meal = req.body;
    const cookId = req.userId;
  
    try {
      // Validate meal data fields
      assert(typeof meal.maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
      assert(typeof meal.price === 'number', 'price must be a number');
      assert(typeof meal.imageUrl === 'string', 'imageUrl must be a string');
      assert(typeof meal.name === 'string', 'name must be a string');
      assert(typeof meal.description === 'string', 'description must be a string');
      assert(typeof meal.dateTime === 'string', 'dateTime must be a string');
  
      // Additional validations for specific fields
      assert(meal.maxAmountOfParticipants > 0, 'maxAmountOfParticipants must be greater than 0');
      assert(meal.name.trim().length > 0, 'name must not be empty');
      assert(meal.description.trim().length > 0, 'description must not be empty');
  
      // Assign cookId to the meal
      meal.cookId = cookId;
  
      // Insert the meal into the database
      const sqlStatement = 'INSERT INTO `meal` SET ?';
      pool.getConnection((err, conn) => {
        if (err) {
          logger.error(err.message);
          res.status(500).json({
            status: 500,
            message: 'Failed to connect to the database',
          });
          return;
        }
        conn.query(sqlStatement, meal, (err, result) => {
          if (err) {
            logger.error(err.message);
            res.status(500).json({
              status: 500,
              message: 'Failed to insert meal data into the database',
            });
            return;
          }
          meal.id = result.insertId;
          logger.info('Meal created successfully with ID:', result.insertId);
          res.status(201).json({
            status: 201,
            message: 'Successfully created meal',
            data: meal,
          });
        });
        pool.releaseConnection(conn);
      });
    } catch (err) {
      logger.warn(err.message);
      res.status(400).json({
        status: 400,
        message: err.message,
        data: undefined
      });
    }
  }),

  // not implemented
  // UC-302 update meal
  updateMeal:((req, res, next) => {
    logger.info('update meal')

    
    

  }),

  // UC-303 get all meals
  getAllMeals:((req, res, next) => {
    logger.info('get all meals')

    sqlStatement = 'SELECT * FROM `meal`';

    pool.getConnection(function (err, conn) {
        if (err) {
          logger.error(err.message)
          next({
            status: 500,
            message: 'Failed to connect to the database' 
          })
        }
        if (conn) {
          //conn.query(sqlStatement, sqlParams, function (err, results, fields) {
          conn.query(sqlStatement, function (err, results, fields) {
            if (err) {
              logger.error(err.message)
              next({
                status: 500,
                message: 'Failed to retrieve meal data'
              })
            }
            if (results) {
              logger.info('Found', results.length, 'results');
              res.status(200).json({
                status: 200,
                message: 'Meal data endpoint',
                data: results
              })
            }
          })
          pool.releaseConnection(conn);
        }
    });






  }),

  // UC-304 get meal by id
  getMealById: ((req, res, next) => {
    logger.info('get meal by id');

    const mealId = req.params.mealId;

    const sqlStatement = 'SELECT * FROM `meal` WHERE `id` = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({
                status: 500,
                message: 'Failed to connect to the database',
            });
            return;
        }

        conn.query(sqlStatement, [mealId], (err, result) => {
            if (err) {
                logger.error(err.message);
                next({
                    status: 500,
                    message: 'Failed to retrieve meal data',
                });
                return;
            }

            if (result.length === 0) {
                logger.warn('No meal found with ID:', mealId);
                res.status(404).json({
                    status: 404,
                    message: `Meal with ID ${mealId} not found`,
                    data: undefined
                });
                return;
            }

            const meal = result[0];

            logger.info('Found meal with ID:', mealId);
            res.status(200).json({
                status: 200,
                message: 'Meal data endpoint',
                data: meal,
            });
        });

        pool.releaseConnection(conn);
    });
  }),

  // UC-305 delete meal
  deleteMeal: ((req, res, next) => {
    logger.info('delete meal');

    const id = req.params.mealId;
    const mealId = Number(id);

    const cookIdFromToken = req.userId;

    const searchMealQuery = 'SELECT cookId FROM `meal` WHERE `id` = ?';
    const deleteMealQuery = 'DELETE FROM `meal` WHERE `id` = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({
                status: 500,
                message: 'Failed to connect to the database',
            });
            return;
        }

        conn.query(searchMealQuery, [mealId], (err, result) => {
            if (err) {
                logger.error(err.message);
                next({
                    status: 500,
                    message: 'Failed to retrieve meal data from the database',
                });
                return;
            }

            if (result.length === 0) {
                logger.info(`Unable to find meal with ID ${mealId}`);
                res.status(404).json({
                    status: 404,
                    message: `Unable to find meal with ID ${mealId}`,
                    data: undefined
                });
                return;
            }

            const mealCookId = result[0].cookId;

            logger.debug(typeof cookIdFromToken, typeof mealCookId)

            // Check if cookId from token matches the cookId of the meal
            if (cookIdFromToken !== mealCookId) {
                logger.info('Not authorized to delete this meal');
                res.status(403).json({
                    status: 403,
                    message: 'Not authorized to delete this meal',
                    data: undefined
                });
                return;
            }

            conn.query(deleteMealQuery, [mealId], (err, result) => {
                if (err) {
                    logger.error(err.message);
                    next({
                        status: 500,
                        message: 'Failed to delete meal data from the database',
                    });
                    return;
                }

                logger.info(`Successfully deleted meal with ID ${mealId}`);
                res.status(200).json({
                    status: 200,
                    message: `Successfully deleted meal with ID ${mealId}`,
                    data: undefined
                });
            });
        });

        pool.releaseConnection(conn);
    });
  })


}

module.exports = mealController