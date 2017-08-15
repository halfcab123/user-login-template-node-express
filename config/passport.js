var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
   User.findById(id)
       .then(function(user){
           done(null, user);
       })
       .catch(function(err){
           done(err);
       });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done)   {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:8});
    req.checkBody('name', 'Invalid name').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error)  {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email})
        .then(function(err, user) {
           if(err){
               return done(err);
           }
           if(user){
               return done(null, false, {message: 'Email is already in use.'});
           }
           var newUser = new User();
           newUser.name = req.body.name;
           newUser.email = email;
           newUser.password = newUser.encryptPassword(password);
           newUser.save(function(err){
            return done(null, newUser);
       })
           .catch(function(err){
               return done(err);
           });
    }).catch(function(err){
        return done(err);
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error)  {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'No user found.'});
        }
        if(!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password'})
        }
        return done(null, user);
    });
}));