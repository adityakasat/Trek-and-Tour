const mysql = require('mysql');
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
const dom = new JSDOM('mybooking.html').window.document;

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,                  // 'host' name is stored under var 'DATABASE_HOST' inside the '.env' file
    user: process.env.DATABASE_USER,                  // (same as above)
    password: process.env.DATABASE_PASSWORD,          // (same as above)
    database: process.env.DATABASE                    // (same as above)
});

exports.register = (req,res) => {
    const {username, email, password, confirm_password} = req.body;
    
    db.query('SELECT email FROM users where email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
        }
        if(results.length>0) {      // email is already registered
            console.log('\nEmail is already registered');
            return res.render('register', {
                message: 'Email is already registered!'
            })
        }
        else if(password !== confirm_password) {
            console.log('\nPasswords do not match!');
            return res.render('register', {
                message: 'Passwords do not match!'
            })
        }

        db.query('INSERT INTO users SET ?', {username: username, email: email, password: password}, (error, results) => {
            if(error) {
                res.redirect('/register');                
            }
            else {
                console.log('\nNew User is Registered!');
                console.log(req.body);
                res.redirect('/login')
            }
        })
    })
}

exports.login = (req,res) => {
    const {email, password} = req.body;
    
    db.query('SELECT email FROM users where email = ?', [email], (error, results) => {
        
        if(results.length>0) {                            // correct credentials are entered
            console.log('\nEmail matched');               // results[0].email
        
            db.query('SELECT email,password FROM users where email = ? and password = ?',[email, password],(error, check_pw_results) => {
                
                if(check_pw_results.length>0) {
                    console.log('Password matched');      // check_pw_results[0].password
                    console.log('User Logged in!');
                    console.log(req.body);
                    res.cookie(`Cookie token name`,email);              // generated a cookie of 'value = email' for the logged-in user
                    res.redirect('/setcookie')
                }
                else {
                    console.log('Wrong Password entered!');
                    return res.render('login', {
                        message: 'Wrong Password entered!'
                    })
                }
            })            
        }
        else {
            console.log('\nUser is not registered!');
            return res.render('login', {
                message: 'User is not registered!'
            })
        }
    })
}


exports.book = (req,res) => {

    const {booking_id, destination, check_in, check_out, rooms, adults, children} = req.body;
    var {user_email, bookings_left} = req.body;

    user_email = req.cookies['Cookie token name'];

    db.query('SELECT dest, bookings_left FROM available_bookings where dest = ?', [destination, bookings_left], (error, results) => {
        
        console.log()
        if(results.length>0) {  
            
            let upd_bookings = results[0].bookings_left - parseInt(adults) - parseInt(children);
            
            if(results[0].bookings_left>0 && upd_bookings>=0) {
                
                db.query('SELECT user_email,check_in FROM bookings where destination = ? and check_in = ? and check_out = ?', 
                [destination, check_in, check_out], (error, results_alr_booked) => {
                    
                    var g1 = new Date(check_in);
                    var g2 = new Date(check_out);
                    
                    if(g2.getFullYear()>g1.getFullYear || g2.getMonth()>g1.getMonth() || g2.getDate()>g1.getDate()) {
 
                        if(results_alr_booked.length>0) {
                            console.log('\nYou have already booked this tour for '+ destination + ' for the same date slot!');
                            console.log(req.body);
                            return res.render('book', {
                                message: 'You have already booked this tour for '+ destination + ' for the same date slot!'
                            })  
                        }
                        else {    
                            db.query('UPDATE available_bookings SET bookings_left = ? WHERE dest = ?', [upd_bookings, destination], (error, result_upd) => {
                                if(error) {
                                    console.log(error)
                                    res.redirect('/book');
                                }
                                else {
                                    console.log('\nNew Booking Updated to the database, bookings left for '+ destination + ' = ' + upd_bookings);
                                }
                            })
                            
                            db.query('INSERT INTO bookings SET ?', {user_email: user_email, destination: destination, check_in: check_in, 
                                check_out: check_out, rooms: rooms, adults: adults, children: children},(error, results_) => {
                                if(error) {
                                    res.redirect('/book');                
                                }
                                else {
                                    
                                    console.log('\nNew Booking Details:');
                                    console.log(req.body);
    
                                    var b_id = '';
                                    db.query('SELECT booking_id FROM bookings where destination = ? and check_in = ? and check_out = ?', [destination, check_in, check_out], (error, results_b_id) => {
                                        if(error) {
                                            res.redirect('/book');                
                                        }
                                        else {
                                            b_id = results_b_id[0].booking_id;
                                            console.log('temp id = '+ b_id);
                                        }
                                    })
                                    res.redirect('/logged_in');
                                }
                            })
    
                        }                        
                    }
                    else {
                        console.log('\nCheck-in Date: '+g1.getDate()+'/'+g1.getMonth()+'/'+g1.getFullYear());
                        console.log('Check-out Date: '+g2.getDate()+'/'+g2.getMonth()+'/'+g2.getFullYear());
                        console.log('\nInvalid Check-In and Check-Out Date!');

                        return res.render('book', {
                        message: 'Invalid Check-In and Check-Out Date!'
                        })                         

                    }
                
                })
                
            }
            else {
                
                if(results[0].bookings_left === 0) {
                    console.log('\nSorry, tours for ' + destination + ' is fully booked!');
                    return res.render('book', {
                    message: 'Sorry, tours for ' + destination + ' is fully booked!'
                    })  
                }
                else {
                    console.log('\nSorry, only ' + results[0].bookings_left + ' person bookings are remaining for tours in ' + destination);
                    return res.render('book', {
                    message: 'Sorry, only ' + results[0].bookings_left + ' person bookings are remaining for tours in ' + destination
                    }) 
                }
                
            }
        }
        else {
            console.log('\nSorry, destination tour for ' + destination + ' is currently not available on our website!');
            return res.render('book', {
                message: 'Sorry, destination tour for ' + destination + ' is currently not available on our website!'
            })     
        }        
    })
}