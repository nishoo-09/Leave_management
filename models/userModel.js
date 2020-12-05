const mongoose =  require('mongoose');
const config =  require('../config/database');
mongoose.connect(config.mongoURL,  {useNewUrlParser: true, useUnifiedTopology: true});
const userModel = new mongoose.Schema({
	username:{
		type:String,
		required:true,
		index:{unique:true}
	},
	email:{	
		type:String,
		required:true,
		index:{unique:true}
	},
	password:{
		type:String,
		required:true
	},
	resetToken:String,
	expireToken:Date,
	date:{
		type:Date,
		default:Date.now()
	}
});
const newUser = mongoose.model('users',userModel);
module.exports = newUser;