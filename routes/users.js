const express = require('express');
const app = express();
const router = express.Router();
const userModel = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const transporter = require('../config/email');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
	
/* Sign Up page. */
router.get('/signup', function(req, res, next) {
	if(req.user)
		res.redirect('/users/dashboard');
  res.render('admin/signup', { title: 'Sign Up Account' });
});
/* Sign Up page using post method*/
router.post('/signup', function(req, res, next) {
	let {username, email, password, confirmPassword} = req.body;
	let error_msg = [];
	let success = '';
	if(username.trim() == '' || email.trim() == '' || password.trim() == '' || confirmPassword.trim() == '') {
		error_msg.push({message : "All fields must be required"});
	}
	if(password !== confirmPassword) {
		error_msg.push({message : "Password do not matched"});
	}
	if(error_msg.length>0) {
		res.render('admin/signup', { 
			title: 'Sign Up Account' , 
			email, 
			username, 
			password,
			confirmPassword,
			error_msg
		});
	}
	else {
		const newUser = new userModel({
			username,
			email,
			password
		});
		bcrypt.genSalt(10, (err, salt)=>bcrypt.hash(newUser.password, salt, (err, hash)=>{
			if(err) throw err;
			newUser.password = hash;
			newUser.save((err, result)=>{
				if(err) throw err;
				if(result) {
					req.flash('success', "You are now registered and you can login");
					res.redirect('/users/login');
				}
			})
		} ));
	}
});

/* Login page. */
router.get('/login', function(req, res, next) {
	if(req.user)
		res.redirect('/users/dashboard');
  res.render('admin/login', { title: 'Login To Account'});
});
router.post('/login', function (req, res, next) {
	passport.authenticate('local', { 
	successRedirect: '/users/dashboard',
  failureRedirect: '/users/login',
  failureFlash: true
  })(req, res, next);
});
router.get('/forget-password', function(req, res, next) {
	res.render('admin/forgetPassword', { title: 'Forget Password'});
});
router.post('/forget-password', function(req, res, next) {
	let email = req.body.email;
	crypto.randomBytes(32, (err, buffer)=>{
		if(err) throw err;
		const token = buffer.toString('hex');
		userModel.findOne({email:email}).then((user)=>{
			if(!user) {
				req.flash('error', 'User dont exists with this email');
				res.redirect('back');
			}
			else {
				user.resetToken = token;
				user.expiredToken = Date.now()+3600000;
				user.save().then((result=>{
					const mailData = {
						from: 'no-replay@gmail.com',  // sender address
					  to: email,   // list of receivers
					  subject: '[LMS] Please reset your password',
					  html: `<p>We heard that you lost your LMS password. Sorry about that!</p>
					  <p>But don’t worry! You can use the following link to reset your password:</p>
					  <h5>click in this 
					  <a href="http://localhost:8000/users/reset?token=${token}">link
					  </a>
					  </h5>
					  <p>If you don’t use this link within 3 hours, it will expire. To get a new password reset link, visit http://localhost:8000/users/forget-password</p>`

					};
					transporter.sendMail(mailData, function (err, info) {
					  if(err)
					    throw err;
					  else {
					  	req.flash('success', 'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder. ');
					    res.redirect('back');
					  }
					});
				}));
			}
		});
	});
});

// reset password
router.get('/reset:token?', function(req, res, next) {
	const token = req.query.token;
	if(!token) {
		req.flash('error', 'Please move on same by clicking on link again which you have got in mail');
		res.redirect('back');
	}
	userModel.findOne({resetToken:token}).then((user)=>{
		if(!user) {
			req.flash('error', 'Wrong Token Id');
			res.redirect('back');
		}
		else
			res.render('admin/reset', { title: 'Reset Password' , email:user.email});
	});
});
router.get('/dashboard', function(req, res, next) {
  res.render('admin/dashboard', { title: 'Admin Dashboard'});
});
router.post('/reset:token?', function(req, res, next) {
	let {email, password, confirmPassword} = req.body;
	let error_msg = [];
	let success = '';
	if(email.trim() == '' || password.trim() == '' || confirmPassword.trim() == '') {
		error_msg.push({message : "All fields must be required"});
	}
	if(password !== confirmPassword) {
		error_msg.push({message : "Password do not matched"});
	}
	if(error_msg.length>0) {
		res.render('admin/reset', { 
			title: 'Reset Password' , 
			email, 
			password,
			confirmPassword,
			error_msg
		});
	}
	else {
		userModel.findOne({email:email}).then(user=>{
			if(!user) {
				req.flash('error', 'User dont exists with this email');
				res.redirect('back');
			}
			else {
				bcrypt.genSalt(10, (err, salt)=> {
					bcrypt.hash(password, salt, (err, hash)=>{
						if(err) throw err;
						password = hash;
						userModel.update({email:email},{password:password}, (err, result)=>{
							if(err) throw err;
							if(result) {
								req.flash('success', "You are now successfully reset the password and you can login");
								res.redirect('/users/login');
							}
						});
					});
				});
			}
		});
	}
});

// change password
router.get('/change-password', function(req, res, next) {
	res.render('admin/changePassword', { title: 'Change Password'});
});
router.post('/change-password', function(req, res, next) {
	let {newPassword, confirmPassword} = req.body;
	let error_msg = [];
	let success = '';
	if(newPassword.trim() == '' || confirmPassword.trim() == '') {
		error_msg.push({message : "All fields must be required"});
	}
	if(newPassword !== confirmPassword) {
		error_msg.push({message : "Password do not matched"});
	}
	if(error_msg.length>0) {
		res.render('admin/changePassword', { 
			title: 'Change Password' , 
			error_msg
		});
	}
	else {
    userModel.update({email:req.user.email},{password:newPassword}, (err, result)=>{
			if(err) throw err;
			if(result) {
				req.flash('success', "Password Successfully Updated");
				res.redirect('back');
			}
		});
	}
});


// user log out
router.get('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/users/login');
});

// middleware to check user logged in or not
function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}
module.exports = router;
