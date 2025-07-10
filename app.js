const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const apiRoutes = require('./routes');

const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.DB_URI;

const app = express();
app.use(bodyParser.json());

app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data  = error.data;
    res.status(status).json({ message: message, data : data });
});

mongoose.connect(
    MONGODB_URI
).then(result => {
    console.log("Connected!");
    app.listen(port);
}).catch(err => {
    console.log(err);
}); 