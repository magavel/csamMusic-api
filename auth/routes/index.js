const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');


router.post('/register', (req, res)=>{
    console.log('user from req.body ', req.body);
    const newUser =  new User(req.body);
    newUser.save((err, user)=>{
        if(err){
            return res.status(500).json(err);
        }
        req.login(req.body, err=>{
            if(err){

                console.log('erreur ds register login', err);
            }

            res.status(200).json(user);
        }
        );

    });
});



router.post('/login', passport.authenticate('local', {
    successRedirect:'/auth/success',
    failureRedirect:'/auth/failure',
    failureFlash: true 
}));

router.get('/success', (req, res)=>{
    res.status(200).json({msg: 'logged in!!', user: req.user});
});

router.get('/failure', (req, res)=>{
    res.status(200).json({msg: 'pas du tout loggé!!'});
});


module.exports = router;