var express = require('express');
var router = express.Router();
const contactModel = require('../models/contactModel');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Leave Management System', home:'home'});
});

/* Dashboard page*/ 

/* About us page. */
router.get('/about-us', function(req, res, next) {
  res.render('aboutus', { title: 'About Us'});
});

/* Contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contact Us'});
});
router.post('/contact', function(req, res, next) {
  const {
  	name,
  	email,
  	subject,
  	description
  } = req.body;
  if(name == '') {
  	req.flash('error','Name should not be empty');
  	res.redirect('back');
  }
  if(email == '') {
  	req.flash('error','Email should not be empty');
  	res.redirect('back');
  }
  if(subject == '') {
  	req.flash('error','Subject should not be empty');
  	res.redirect('back');
  }
  if(description == '') {
  	req.flash('error','Description should not be empty');
  	res.redirect('back');
  }
  const newContact = new contactModel({
  	name,
  	email,
  	subject,
  	description
  });
  newContact.save().then(result=>{
  	console.log(result);
  	req.flash('success', 'Message successfully sent');
  }).catch(err=>console.log(err));
});
function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
