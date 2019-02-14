const amqp = require('amqplib');
const log4js = require('log4js');
const logger = log4js.getLogger('siteminder');
const request = require('request-promise');
const MAIL_QUEUE = 'mail';
//require('request-debug')(request);
//require('request').debug = true;

// Send Grid 
const createGridRequest = function(data) {
    return new Promise(function(resolve, reject) {

    let options ={
        uri: 'https://api.sendgrid.com/v3/mail/send',
        method:'POST', 
        json: true,
        // resolveWithFullResponse: true, 
        headers: {
          'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
          'Accept' : 'application/json'
        },
          body: {
              personalizations:[{subject:data.subject}],
              //subject: data.subject,
              from: {'email': data.from },
              content:[{'type':'text/plain',
                    'value': data.message
                  }]
              }
     };

     // Add mandatory To: 
      let toObj=[];
      if(Array.isArray(data.to)){
          for(let i in data.to){
              toObj.push({'email' : data.to[i]});
          }
      }else{ 
          toObj.push({'email' : data.to});
      }
      options.body.personalizations[0].to = toObj;

     // Add CC if it exists
     let cc = (data.cc && data.cc.toString());
     if(typeof cc  !== 'undefined' && cc ){
        let ccObj=[];
        if(Array.isArray(data.cc)){
           for(let c in data.cc){
              ccObj.push({'email' : data.cc[c]});
           }
         }else{
             ccObj.push({'email' : data.cc});
         }
         options.body.personalizations[0].cc = ccObj;
     }

      //Add BCC if it exists
      let bcc = (data.bcc && data.bcc.toString());
      if(typeof bcc  !== 'undefined' && bcc ){
          let bccObj=[];
          if(Array.isArray(data.bcc)){
             for(let b in data.bcc){
                bccObj.push({'email' : data.bcc[b]});
             }
           }else{
               bccObj.push({'email' : data.bcc});
           }
           options.body.personalizations[0].bcc = bccObj;
      }
      
      request(options).on('response', function(response) {
        /*
        console.log('B response --');
        console.log(response);
        console.log('E response --');
        */
        resolve({'statusCode':response.statusCode,'statusMessage':response.statusMessage});
      }).catch(function (err) {
        //logger.error(err); 
        reject({'statusCode':404,'statusMessage':err});
    });
  });
}; 


// Consume and a message from the MQ
amqp.connect(process.env.CLOUDAMQP_URL)
  .then(conn => {
    return conn.createChannel();
  })
  .then(ch => {
    ch.assertQueue(MAIL_QUEUE, { durable: false });
    ch.prefetch(1);
    logger.info(" [x] SendGrid Worker: Awaiting requests");    
    
    // Retrieve item from MQ
    ch.consume(MAIL_QUEUE, async (msg) => {
      
      logger.info(" [x] SendGrid Worker: Consume");
      
      let jdata = JSON.parse(msg.content.toString());
      logger.info(" [x] SendGrid CONSUMED DATA");
      logger.info(msg.content.toString());

      const httpResponse = await createGridRequest(jdata);
      let queueResponse = JSON.stringify(httpResponse);
  
      // Send status code back up 'replyTo' queue
      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(queueResponse),
        {
         correlationId: msg.properties.correlationId
        });
      ch.ack(msg); 
    })
  });

