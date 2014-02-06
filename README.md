# Responder

Find the nearest WHO treatment center for TB in the Philippines via an SMS interview.

## Server Deployment

This application talks to a MongoDB back end, and requires a [Twilio account and number](http://www.twilio.com) for SMS integration.  Further, this application is set up to pipe data into a [Ushahidi](http://ushahidi.com/) instance.  

This app should be deployable to any node.js host, but it currently resides on Heroku.  Before deploying to Heroku, you will need to export the necessary configuration values as environment variables `heroku config:add`:

#### MONGOHQ_URL
The connection URL for a MongoDB instance.  The name suggests it needs to be [MongoHQ](http://www.mongohq.com), but any MongoDB connection URL will work.

#### TWILIO_SECRET
A random string.  You can generate one with `openssl rand -base64 32`.  You will need this when you configure Twilio number web hooks.  This will be used to provide a thin layer of security to ensure incoming SMS requests are coming from known clients.  Twilio has a more secure way of doing this, but this allows the endpoints to change, and is more friendly for PaaS systems like Heroku and Nodejitsu.

#### USHAHIDI_URL
A Ushahidi API server.  It should be locked down to be a private instance, with approval for new users, and a user should be set up to add reports.  Example: `https://www.haiyantextforhelp.com/index.php/api`

#### USHAHIDI_USER
A valid Ushahidi user (your e-mail).  [Sign up on the site](https://www.haiyantextforhelp.com/) and I will approve you for testing.

#### USHAHIDI_PASSWORD
A valid password for the above user.  Used to auth against Ushahidi.

## Twilio Configuration
This node app has `/sms` and `/voice` endpoints.  Append a query parameter to each - `?secret=your TWILIO_SECRET from above`.  Use these in your Twilio number configuration:

![number config](http://demo.kevinwhinnery.com/upload/Phone_Number_Haiyan_Report_Test_%7C_Dashboard_%7C_Twilio-20131119-140406.png)

## License

MIT
