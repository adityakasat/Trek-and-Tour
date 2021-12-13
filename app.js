const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieparser = require("cookie-parser");
dotenv.config({path: './.env'});

const app = express();
app.use(cookieparser());

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,                  // host is stored under var 'DATABASE_HOST' inside the '.env' file
    user: process.env.DATABASE_USER,                  // (same as above)
    password: process.env.DATABASE_PASSWORD,          // (same as above)
    database: process.env.DATABASE                    // (same as above)
});

const publicDirectory = path.join(__dirname, './public');     // '__dirname' in nodejs gives access to the current directory
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended: false}));         // Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json());                                // Parse JSON bodies (as sent by API clients)

app.set('view engine', 'hbs');

db.connect( (error) => {
    if(error) {
        console.log(error);
    }
    else {
        console.log("MySQL connected.\n");
    }
}); 

// Define routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(3000,() => {
    console.log("Listening on Port 3000");
})