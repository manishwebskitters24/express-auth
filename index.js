const cookieParser = require('cookie-parser');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({path: './config/config.env'});
require('./config/conn');

const app = express();
const route = require('./routes/user.route.js');

app.use(express.json());
app.use(cookieParser());

app.use('/api', route);

app.get('/', (req, res) => {
    res.send('Localhost is working');
})

app.listen(process.env.PORT, () => {
    console.log(`Server is listening at ${process.env.PORT}`);
});