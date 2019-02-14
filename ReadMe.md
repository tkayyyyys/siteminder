
## Install
> npm init
> npm run dev

 The following keys are required in your local .env:
  SENDGRID_API_KEY=
  MAILGUN_API_KEY=
  MAILGUN_DOMAIN=
  CLOUDAMQP_URL=

## Test
> npm run test


## Notes siteminder backend dev-test

## Stack

 * Express framework	
 * Rabbit MQ for round-robin distribution which forwads emails to 2 workers - MailGun & SendGrid
 * Log4j for logging
 * Chai & Mocha for testing


## ENV
 * Dev environment only. 
 * Ideally should be configured to include TEST + PROD

## Rabbit MQ

* Very basic setup with two queues. One for messages and one for reply-to responses.

* Currently if one email provider fails, the inital request causing the fail will get 'stuck'.
* No expiration set on messages (TTL). In IRL scenario this should be set to avoid the queue filling up.
* NO deadletter queue. Ideally a retry with exponential back-off of should be set. unsticking 'stuck' msgs

* Responses are statusCode & statusMessage - retrieved from Mail API's. Verbosity of messages should be improved.
* Rabbit MQ is provided as a service by https://www.cloudamqp.com/


## Input Validation

 * Input Validation is very basic
 	* Only email addresses are accepted. No "names" or <> bracket combos. 
 		* This will fail : "Fred Durst <fred.durst@gmail.com>"
 		* OK : fred.durst@gmail.com

 * Uses Regex in places. Generally Regex should be avoided for input validation in production as it can be exploited.

 * Character length of email 'subject' and 'body' should be enforced in accordance to mail provider limits.
 * Input should be correctly sanitised.

 * Sendgrid allows >= 1000 CC + BCC + T0 email addresses in Personalzations. This limit should be enforced in validation.
 * Sendgrid does not allow duplicates in CC, TO or BCC. These fields should be checked for duplication.

 * MailGun emails which are registered are 'tkobialka@gmail.com'. Sending to non-regestired email addresses will fail. Please let me know if you'd like to test the service and I will whitelist your email.

## TEST
 * Very basic tests added to illustrate e2e functionality including input validation and successful sending of emails
 * In Prod Unit tests should be included per each of the function worker queue functions - mailGunWorker and SendGridWorker 

## Errors

 * Basic error handling setup.
 * Verbosity of error messages should be improved (e.g inc stack trace when run in a dev environment)





