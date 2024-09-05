const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const movieRoute = require('./routes/movieRoute');
const adminRoute = require('./routes/adminRoute.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODBURI)
.then(() => {
    console.log(`Database connected: ${mongoose.connection.host}`)
})
.catch((error) => console.log(error));

//END OF IMPORTS

//ejs setup
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//cookie-parser
app.use(cookieParser());
app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: process.env.SESSION_SECRET
}))

//static files
app.use(express.static('public', {root: __dirname}))

//routes
app.use('/', movieRoute);
app.use('/', adminRoute);
/* 
//GET home
app.get('/', (req, res) => {
    res.render('main/index')
}) */

//GET about
app.get('/about', (req, res) => {
    res.render('main/about')
})

//Error Page
app.use((req, res) => {
    res.render('main/error')
})


app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`)
})