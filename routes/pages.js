const express = require('express');
const passport = require('passport');
const session = require('express-session')
const router = express.Router();
const path = require('path');

// router.use(passport.initialize());
// router.use(passport.session());
require('./auth');


router.get('/',(req,res) => {
    let username = req.cookies['Cookie token name'];
    return res.render('home',{username});
});

router.get('/logged_in',(req,res) => {
    let username = req.cookies['Cookie token name'];
    console.log('\n(User is logged in) - ' + username);               // check if user is logged in, by checking cookie value
    res.render('home1');
});

router.get('/login',(req,res) => {
    res.render('login');
});

router.get('/register',(req,res) => {
    res.render('register');
});

router.get('/setcookie', (req, res) => {
    console.log('Cookie have been saved successfully');
    console.log(req.cookies);
    res.redirect('/logged_in');    
});

router.get('/deletecookie', (req, res) => {
    res.clearCookie('Cookie token name');                       
    console.log('Check if the user cookie is deleted - ')
    console.log(req.cookies)                                //show the saved cookies
    console.log('Cookie has been deleted successfully');
    return res.status(200).redirect('/');
});

router.get('/book',(req,res) => {
    let ch_user = req.cookies['Cookie token name'];
    if(ch_user)
        res.render('book');
    else
    {
        return res.render('home', {
            message: 'Please Login before Booking a Tour!'
        })
    }
});

module.exports = router;
