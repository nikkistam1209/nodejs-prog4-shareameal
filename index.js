//const User = require('./user')

const express = require('express')
const assert = require('assert')
const logger = require('./src/util/utils').logger;
const userRoutes = require('./src/routes/user.routes')

const app = express()
const port = 3000
const hostname = '127.0.0.1';

app.use(express.json())

app.listen(port, () => {
  console.log(`Example app listening on port http://${hostname}:${port}/`)
})

// // in memory database
// let users = []
// users.push(new User(1, 'Nikki', 'Stam', 'straat', 'Dordrecht', true, 'nikki.stam@hotmail.com', 'password', '06 29414389'))
// users.push(new User(2, 'Henk', 'van den Adel', 'straat', 'Zwijndrecht', true, 'henk@gmail.com', '1234', '06 12345678'))
// // index voor eerstvolgende user die toegevoegd wordt
// let index = 3;



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


// wanneer endpoint niet gevonden kan worden
app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {}
  });
});


// app.use((req, res, next) => {
//   res.status(404).send("Sorry can't find that!")
// })

// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).send('Something broke!')
// })




module.exports = app;