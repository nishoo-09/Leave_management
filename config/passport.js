const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    userModel.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'User is not registered' });
      }
      bcrypt.compare(password, user.password, function(err, isMatch) {
        if(isMatch) {
          return done(null, user);
        }
        else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      })
    });
  },

  ));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    userModel.findById(id, function(err, user) {
      done(err, user);
    });
  });

}