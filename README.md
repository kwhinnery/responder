# Responder

Allow Filipinos affected by the storm to report conditions on the ground via SMS, allowing the international aid community to better plan their response.

## Server Deployment

This application talks to a MongoDB back end, and requires a [Twilio account and number](http://www.twilio.com) for SMS integration.  Further, this application is set up to pipe data into a [Ushahidi](http://ushahidi.com/).  For now, the Ushahidi server is hard-coded, but could be moved to an environment variable soon.

This app should be deployable to any node.js host, but it currently resides on Heroku.  Before deploying to Heroku, you will need to export the necessary configuration values as environment variables `heroku config:add`:

#### MONGOHQ_URL
The connection URL for a MongoDB instance.  The name suggests it needs to be [MongoHQ](http://www.mongohq.com), but any MongoDB connection URL will work.

#### TWILIO_SECRET
A random string.  You can generate one with `openssl rand -base64 32`.  You will need this when you configure Twilio number web hooks.

## Twilio Configuration
The node app has `/sms` and `/voice` endpoints.  Append a query parameter to each - `?secret=your TWILIO_SECRET from above`.  Use these in your Twilio number configuration:

![number config](http://demo.kevinwhinnery.com/upload/Phone_Number_Haiyan_Report_Test_%7C_Dashboard_%7C_Twilio-20131119-140406.png)

## License

MIT