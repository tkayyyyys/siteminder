const express = require('express');
const router = express.Router();
const log4js = require('log4js');
const logger = log4js.getLogger('siteminder');
const amqpQueue = require('../queue/mainQueue');
const amqpGridWorker = require('../queue/sendGridWorker');
const amqpGunWorker = require('../queue/mailGunWorker');
const {check, validationResult} = require('express-validator/check');
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


// Initialise the MQ
amqpQueue.init().catch(
	(err)=>
	{
		logger.error(" RabbitMQ Queue Startup Error" + err);
	}
);

// Validate incoming email addresses. Allows for arrays. 
const emailValidator = (t) => {
	if(Array.isArray(t)){
		for(j in t){
			let regEx = EMAIL_REGEX;
			//console.log(t[j]);
			// console.log(regEx.test(t[j]));
  			if(!regEx.test(t[j])) return false;
		}
		console.log('TRUE');
		return true;
	}else{
		let regE = EMAIL_REGEX;
		return regE.test(t);
	}
 }

router.post('/mail/', [
		// Input Validation 
		check('to').exists(),
		check('from').exists(),
		check('to').custom(emailValidator),
		check('from','Incorrect FROM value.').isEmail(),
		check('cc', 'Incorrect CC value.').optional().custom(emailValidator),
		check('bcc', 'Incorrect BCC value.').optional().custom(emailValidator),
		check('subject', 'You must include a email subject').exists(),
		check('message', 'You must include a email message').exists()
	], function (req, res) {

	  const errors= validationResult(req); 
	  if (!errors.isEmpty()) {
	  	logger.error(" BAD INPUT: " + JSON.stringify(validationResult(req).mapped()));
	    return res.status(422).json({ errors: errors.array() });
	  } 

	 // Send our request to the MQ 
	 amqpQueue.send(req, res);
});


module.exports = router;