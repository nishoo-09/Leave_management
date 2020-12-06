var express = require('express');
var router = express.Router();
const countryList = require('city-state-country');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path'); 
const multer = require('multer'); 
const employeeModel = require('../models/employeeModel');
const leaveModel = require('../models/leaveModel');
const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// middleware for image uploading
var storage = multer.diskStorage({
  destination: 'public/uploads/', 
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
//init filenishu uploading
var upload = multer({
  storage: storage,
  limits:{fileSize:100000000},
  fileFilter: (req, file, cb)=>{
  	checkFileType(file, cb);
  }
});

const checkFileType = (file, cb) => {
	// Allowed Extension
	const fileTypes = /jpeg|jpg|png|gif/;
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
	const mimeType = fileTypes.test(file.mimetype);
	if(mimeType && extname) {
		return cb(null, true);
	}
	else {
		return cb(new Error('Only images are allowed'));
	}
};

// Add New Employee
router.get('/add-employee', (req, res, next) => {
  res.render('employee/addEmployee', { title: 'Add New Employee', getAllCountries:countryList.getAllCountries()});
});
router.post('/add-employee',upload.single('addImage'), (req, res, next) => {

	const {
		username, 
		userRole,
		password, 
		confirmPassword, 
		name,
		email,
		phone,
		gender,
		dateOfBirth,
		address,
		country,
		state,
		city,
		myImage
	} = req.body;
	if(
		username.trim() == '' || 
		userRole.trim() == '' || 
		password.trim() == '' || 
		confirmPassword.trim() == '' ||
		name.trim() == '' ||
		email.trim() == '' || 
		phone.trim() == '' ||
		gender.trim() == '' ||
		dateOfBirth.trim() == '' ||
		address.trim() == '' ||
		country.trim() == '' ||
		state.trim() == '' ||
		req.file.filename === undefined ) {
		req.flash('error', 'All fields are mendatory');
		res.redirect('back');
	}
	if(password !== confirmPassword) {
		req.flash('error', 'Password do not matched');
		res.redirect('back');
	}
	employeeModel.findOne({username:username}).then(user=>{
		if(user) {
			req.flash('error', 'User already exists with this username');
			res.redirect('back');
		}
	});
	employeeModel.findOne({email:email}).then(user=>{
		if(user) {
			req.flash('error', 'User already exists with this email');
			res.redirect('back');
		}
		else {
			const newEmployee = new employeeModel({
				username, 
				userRole, 
				password, 
				name,
				email,
				phone, 
				gender,
				dateOfBirth,
				address,
				country,
				state,
				city,
				img: { 
	          data: fs.readFileSync(path.join(__dirname + '/../public/uploads/' + req.file.filename)), 
	          contentType: 'image/png'
	      } 
			});
			bcrypt.genSalt(10, (err, salt)=>bcrypt.hash(newEmployee.password, salt, (err, hash)=>{
				if(err) throw err;
				newEmployee.password = hash;
				newEmployee.save().then(result=>{
					if(result) {
						fs.unlinkSync(__dirname + '/../public/uploads/' + req.file.filename);
						req.flash('success', 'You are successfully saved');
						res.redirect('back');
					}
				}).catch(err=>{
					console.log(err);
					req.flash('error', "Oops something went wrong!");
					res.redirect('back');
				});
			}));
		}
	}).catch(err=>console.log(err));

});

// edit employee
router.post('/employee-edit',upload.single('editImage'), (req, res, next) => {
	const {
		email,
		userRole,
		password,
		name,
		phone,
		gender,
		dateOfBirth,
		address,
		myImage
	} = req.body;
	if(
		email.trim() == '' || 
		userRole.trim() == '' || 
		password.trim() == '' || 
		name.trim() == '' ||
		phone.trim() == '' ||
		gender.trim() == '' ||
		dateOfBirth.trim() == '' ||
		address.trim() == '' ||
		req.file.filename === undefined ) {
			req.flash('error', 'All fields are mendatory');
			res.redirect('back');
	}
	bcrypt.genSalt(10, (err, salt)=>bcrypt.hash(password, salt, (err, hash)=>{
		if(err) throw err;
		let passwords = hash;
		employeeModel.update({email:email},{
			userRole:userRole,
			password:passwords,
			name:name,
			phone:phone,
			dateOfBirth:dateOfBirth,
			img: { 
        data: fs.readFileSync(path.join(__dirname + '/../public/uploads/' + req.file.filename)), 
        contentType: 'image/png'
      }
		}).then(success=>{
			if(success){
				fs.unlinkSync(__dirname + '/../public/uploads/' + req.file.filename);
				req.flash('success', "successfully updated");
				res.redirect('back');
			}

		}).catch(err=>console.log(err));
		
	}));
});

// remove employee
router.get('/employee-delete:id?', (req, res, next) => {
	employeeModel.findByIdAndRemove({_id:req.query.id}).then(result=>{
		if(result){
			req.flash('success', 'successfully removed');
			res.redirect('back');
		}
	}).catch(err=>console.log(err));
});

// Employee details
router.get('/employee-detail', (req, res, next) => {
	let data = employeeModel.find().then(result=>{
		if(result && result.length>0)
			res.render('employee/employeeDetail', { title: 'Employee Listing', results:result});
		else
			res.render('employee/employeeDetail', { title: 'Employee Listing', err:"No Employee Found"});
	}).catch(err=>console.log(err));
});

router.get('/states-list:country?', (req, res, next) => {
  const stateName = countryList.getAllStatesFromCountry(req.query.country);
  res.render('employee/statesList', {stateName:stateName});
});
router.get('/city-list:state?', (req, res, next) => {
  const cityName = countryList.getAllCitiesFromState(req.query.state);
  res.render('employee/cityList', {cityName:cityName});
});

// Add New Leave
router.get('/add-leave', (req, res, next) => {
	employeeModel.find({}, {name:1, _id:1}).then(results=>{
		if(results && results.length) {
			res.render('employee/addLeave', { title: 'Add New Leave', results:results});
		}
		else
			res.render('employee/addLeave', { title: 'Add New Leave'});
	}).catch(err=>console.log(err));
});
router.post('/add-leave', (req, res, next) => {
  const {
  	username,
  	userId,
  	lReason,
  	fromDate,
  	toDate,
  	status,
  	description
  	
  } = req.body;
  if( username == '' || username == "Select") {
  	req.flash('error', `Employee name should not be empty`);
	res.redirect('back');
  }
  if( lReason == '' ) {
  	req.flash('error', `Leave reason should not be empty`);
	res.redirect('back');
  }
  if( fromDate == '' ) {
  	req.flash('error', `From date should not be empty`);
	res.redirect('back');
  }
  if( toDate == '' ) {
  	req.flash('error', `To date should not be empty`);
	res.redirect('back');
  }
  if( status == '' || status == "Select") {
  	req.flash('error', `Status should not be empty`);
	res.redirect('back');
  }
  if(Date.parse(fromDate)>Date.parse(toDate)) {
  	req.flash('error', `Invalid Date Range`);
		res.redirect('back');
  }
  const newLeave = new leaveModel({
  	username,
  	lReason,
  	fromDate,
  	toDate,
  	status,
  	description,
  	userId
  });
  newLeave.save().then((result)=>{
  	req.flash('success', 'Leave successfully saved');
  	res.redirect('back');
  }).catch((err)=>console.log(err));
});
router.get('/profile/:id?', (req, res, next) => {
	employeeModel.findOne({_id:req.params.id}).then(result=>{
		if(result && Object.keys(result).length>0){
			leaveModel.find({userId:result._id}).then(leaveResult=>{
				if(leaveResult && leaveResult.length>0)
					res.render('employee/employeeProfile', { title: 'Employee Profile', result:result, leaveResult:leaveResult});
				else
					res.render('employee/employeeProfile', { title: 'Employee Profile', result:result});
			})
		}
		else
			res.render('employee/employeeProfile', { title: 'Employee Profile' });
	});
  
});
router.get('/edit-leave/:id?', (req, res, next) => {
	leaveModel.findOne({_id:req.params.id}).then(result=>{
		if(result)
			res.render('employee/editLeave', { title: 'Update Leave', result:result});
	}).catch(err=>console.log(err));
  
});
router.post('/edit-leave/:id?', (req, res, next) => {
  const {
  	lReason,
  	fromDate,
  	toDate,
  	status,
  	description
  } = req.body;
  if( lReason == '' ) {
  	req.flash('error', `Leave reason should not be empty`);
		res.redirect('back');
  }
  if( fromDate == '' ) {
  	req.flash('error', `From date should not be empty`);
		res.redirect('back');
  }
  if( toDate == '' ) {
  	req.flash('error', `To date should not be empty`);
		res.redirect('back');
  }
  if( status == '' || status == "Select") {
  	req.flash('error', `Status should not be empty`);
		res.redirect('back');
  }
  if(Date.parse(fromDate)>Date.parse(toDate)) {
  	req.flash('error', `Invalid Date Range`);
		res.redirect('back');
  }
  leaveModel.update({_id:req.params.id}, {
	 	lReason:lReason, 
	 	fromDate:fromDate,
	 	toDate:toDate, 
	 	status:status, 
	 	description:description
  }).then(result=>{
 		if(result) {
 			req.flash('success', 'successfully updated');
 			res.redirect('back');
 		}
 }).catch(err=>console.log(err));
});
router.get('/leave-delete/:id?', (req, res, next) => {
	leaveModel.findByIdAndRemove({_id:req.params.id}).then(result=>{
		if(result){
			req.flash('success', 'successfully removed');
			res.redirect('back');
		}
	}).catch(err=>console.log(err));
});
router.get('/leave-detail', (req, res, next) => {
	leaveModel.find().then(result=>{
		if(result){
			res.render('employee/leaveDetails', { title: 'Lists Of Leaves', leaveResult:result});
		}
	}).catch(err=>console.log(err));
});

// middleware to check logged in user or not
function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
