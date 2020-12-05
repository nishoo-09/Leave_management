const mongoose =  require('mongoose');
const config =  require('../config/database');
mongoose.connect(config.mongoURL,  {useNewUrlParser: true, useUnifiedTopology: true});
const employeeModel = new mongoose.Schema({
	username:{
		type:String,
		required:true,
		index:{unique:true}
	},
	userRole:{	
		type:String,
		required:true,
	},
	password:{
		type:String,
		required:true
	},
	name:{
		type:String,
		required:true,
		index:{unique:true}
	},
	email:{	
		type:String,
		required:true,
		index:{unique:true}
	},
	phone:{
		type:Number,
		required:true
	},
	gender:{
		type:String,
		required:true
	},
	dateOfBirth: {
		type:Date,
		required:true
	},
	address:{
		type:String,
		required:true
	},
	country:{
		type:String,
		required:true
	},
	state:{
		type:String,
		required:true
	},
	city:{
		type:String,
	},
	img: { 
      	data: Buffer, 
      	contentType: String,
    },
	date:{
		type:Date,
		default:Date.now()
	}
});
const employee = mongoose.model('employee',employeeModel);
module.exports = employee;