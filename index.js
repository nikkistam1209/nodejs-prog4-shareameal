const express = require('express')
const assert = require('assert')
const logger = require('./src/util/utils').logger;
const userRoutes = require('./src/routes/user.routes')

const app = express()
const port = 443 // 3000
//const hostname = '127.0.0.1';
const hostname = '0.0.0.0';

app.use(express.json())

app.listen(port, () => {
  console.log(`Example app listening on port http://${hostname}:${port}/`)
})

// algemene route 
app.use('*', (req, res, next) => {
  const method = req.method;
  const url = req.baseUrl;
  logger.info(`Received a ${method} request on url ${url}`);
  next();
})

// UC-101 inloggen
// app.get('api/login')


// UC-102 opvragen systeeminformatie
app.get('/api/info', (req, res)=> {
    logger.info('get server information')
  
    res.status(201).json({
    status:201,
    message: 'Server info-endpoint',
    data: {
      studentName: 'Nikki',
      studentNumber: 2145898,
      description: 'Welkom bij de API server van share a meal'
    },
  });
});

// UC-201 t/m 206
app.use('/api/user', userRoutes)

// UC-301 t/m 305
// app.use('api/meal', mealRoutes)

// wanneer endpoint niet gevonden kan worden
app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {}
  });
});


module.exports = app;