const mongoose =  require('mongoose');
const config =  require('../config/database');
mongoose.connect(config.mongoURL,  {useNewUrlParser: true, useUnifiedTopology: true});
const contactModel = new mongoose.Schema({
	name:{
		type:String,
		required:true,
	},
	email:{	
		type:String,
		required:true,
	},
	subject:{
		type:String,
	},
	description:{
		type:String,
	},
	date:{
		type:Date,
		default:Date.now()
	}
});
const contactDb = mongoose.model('contact',contactModel);
module.exports = contactDb;