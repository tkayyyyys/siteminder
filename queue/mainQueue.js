const amqp = require('amqplib');
const EventEmitter = require('events');
const log4js = require('log4js');
const logger = log4js.getLogger('siteminder');
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
const MAIL_QUEUE = 'mail';

// MQ communcation channel for sending requests
let channel = null;

// Identify each message on the MQ uniquely
function generateId() {
  return Math.random().toString() + Math.random().toString() +  Math.random().toString();
}

// Setup the primary RabbitMQ queue
function initQueue() {
   return amqp.connect(process.env.CLOUDAMQP_URL + "?heartbeat=60")
        .then(conn => conn.createChannel())
        .then(ch => {
            logger.info("Initialising the Queue");
           
            channel = ch;
            channel.responseEmitter = new EventEmitter();
            channel.responseEmitter.setMaxListeners(0);
      
            // Setup Reply-to Queue
            channel.consume(REPLY_QUEUE,
             msg => channel.responseEmitter.emit(msg.properties.correlationId, msg.content),{noAck: true});
      });
}

// Push request message to queue
function sendToQueue(req, res) {
  const correlationId = generateId();

  logger.info("correlationId");
  logger.info(correlationId);

  // Fired upon successful response on reply-to channel
    let rmsg = channel.responseEmitter.once(correlationId,  msg => {
    /*  console.log("BGIN responseEmitter");
      console.log(msg.toString());
      console.log("END responseEmitter");
      */
      res.write(msg, 'binary');
      res.end(null, 'binary');
    });

   let input = req.query;

   channel.assertQueue(MAIL_QUEUE, { durable: false })
      .then(channel.sendToQueue(MAIL_QUEUE, 
        Buffer.from(JSON.stringify(input)) , {
          correlationId, replyTo: REPLY_QUEUE }
      )
    );

}

module.exports={
  send (req,res){
    sendToQueue(req,res);
  },
  init(){
    return initQueue();
  }
};
