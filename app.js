const express = require('express');
require('dotenv').config();

const cors = require('cors');

const sockets = require("./modules/socket");
sockets.listen(3001);

const userRoutes = require('./routes/appRoutes.js');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_KEY)
.then(() => { console.log('Connected!'); })
.catch(err => console.log(err));

const app = express();

app.use(express.json());
app.use(cors({
    origin: "*"
}));
app.use("/", userRoutes);


app.listen(2008, () => console.log("Server started on port 2008"));

//npm i bcrypt
//npm i jsonwebtoken
//npm install socket.io
