const amqp = require('amqplib');
const log4js = require('log4js');
const logger = log4js.getLogger('siteminder');
const request = require('request-promise');
const MAIL_QUEUE = 'mail';
/*
require('request-debug')(request);
require('request').debug = true;
*/

// MailGun
// Construct http request object
const createGunRequest = function(data) {
    return new Promise(function(resolve, reject) {
       
       let options ={
          uri: 'https://api.mailgun.net/v3/' + process.env.MAILGUN_DOMAIN + '/messages',
          method:'POST', 
          json: true,
            'auth':{
              'user': 'api',
              'pass':  process.env.MAILGUN_API_KEY
            },
          headers: {
            'Accept' : 'application/json',
          },
            form:{
             // from: 'Mailgun Sandbox <postmaster@sandboxdcb33389faa34dc7b62c4ecd625533d7.mailgun.org>',
              from: data.from,
              to: data.to.toString(),
              subject: data.subject,
              text: data.message,
              multipart : true,
            },
          resolveWithFullResponse: true
      };


      // Append CC and BCC data
      let cc = (data.cc && data.cc.toString());
      if(typeof cc  !== 'undefined' && cc ){
        Object.assign(options.form, {cc: data.cc.toString()});
       }

      let bcc = (data.bcc && data.bcc.toString());
      if(typeof bcc  !== 'undefined' && bcc ){
        Object.assign(options.form, {bcc: data.bcc.toString()});
      }

      // Send
      request(options).on('response', function(response) {
         //console.log('MQ RESPONSE');
         resolve({
          'statusCode':response.statusCode,
          'statusMessage':response.statusMessage,
          });
      }).catch(function (err) {
         logger.error(err);
          reject({'statusCode':404,
                 'statusMessage':err});
      });
     
  });
}; 


// Consume and a message from the Queue.
// Send email via MailGun.
  amqp.connect(process.env.CLOUDAMQP_URL)
   .then(conn => {
      return conn.createChannel();
  }).then(ch => {

      // MailGun MQ startup
      ch.assertQueue(MAIL_QUEUE, { durable: false });
      ch.prefetch(1);
      logger.info(" [x] MailGun Worker: Awaiting requests");    
      
      //MailGun retrieve item from MQ
      ch.consume(MAIL_QUEUE, async (msg) => {

        logger.info(" [x] MailGun Worker: Consume");
        let jdata = JSON.parse(msg.content.toString());

        const httpResponse = await createGunRequest(jdata); 
        let queueResponse = JSON.stringify(httpResponse);
     
        // Send result back on 'replyTo' queue
        ch.sendToQueue(msg.properties.replyTo, new Buffer(queueResponse),
        {
          correlationId: msg.properties.correlationId 
        });   
        ch.ack(msg);
    })
  });



