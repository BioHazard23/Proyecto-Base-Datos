const express = require('express');
const bodyParser = require('express').json;
const customersRouter = require('./routes/customers');
const queriesRouter = require('./routes/queries');
const authRouter = require('./routes/auth');
const path = require('path');

const app = express();
app.use(bodyParser());

app.use('/api/customers', customersRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/auth', authRouter);
// Serve OpenAPI spec
app.get('/openapi.json', (req,res)=> res.sendFile(path.join(__dirname,'..','openapi.json')));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
