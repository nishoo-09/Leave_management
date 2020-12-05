const mongoose =  require('mongoose');
const config =  require('../config/database');
mongoose.connect(config.mongoURL,  {useNewUrlParser: true, useUnifiedTopology: true});
const leaveModel = new mongoose.Schema({
	username:{
		type:String,
		required:true,
	},
	lReason:{
		type:String,
		required:true,
	},
	fromDate:{
		type:Date,
		required:true
	},
	toDate:{
		type:Date,
		required:true
	},
	status:{
		type:String,
		required:true
	},
	description:{
		type:String,
	},
	userId:{
		type:String,
	},
	date:{
		type:Date,
		default:Date.now()
	}
});
const leave = mongoose.model('leave',leaveModel);
module.exports = leave;