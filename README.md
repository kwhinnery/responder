# Responder

Find the nearest WHO treatment center for TB in the Philippines via an SMS interview.

## Server Deployment

This application talks to a MongoDB back end, and requires a [Twilio account and number](http://www.twilio.com) for SMS integration.  Further, this application is set up to pipe data into a [Ushahidi](http://ushahidi.com/) instance.  

This app should be deployable to any node.js host, but it currently resides on Heroku.  Before deploying to Heroku, you will need to export the necessary configuration values as environment variables `heroku config:add`:

#### MONGOHQ_URL
The connection URL for a MongoDB instance.  The name suggests it needs to be [MongoHQ](http://www.mongohq.com), but any MongoDB connection URL will work.

## Twilio Configuration
This node app has `/sms` and `/voice` endpoints.  Use these in your Twilio number configuration for webhooks.

## License

MIT
