// server.js

// BASE SETUP
const keys = require('./config/keys');

// call the packages we need
var express = require('express');
var app = express();

// Database
const mongoose = require('mongoose');
mongoose.connect(
	keys.mongoURI,
	{ useNewUrlParser: true }
);

// bodyParser tillader JSON-posts
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// multer tillader filuploads (billeder til spørgsmål)
const multer = require('multer');
const cloudinary = require('cloudinary');

var port = process.env.PORT || 3001; // set our port

// ROUTES
var router = express.Router();

router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here
require('./routes/question')(app);
require('./routes/feedback')(app);
require('./routes/comment')(app);

// Registrer alle routes fra denne fil (prefixed '/api')
//app.use('/api', router);

if (process.env.NODE_ENV === 'production') {
	// Express will serve prod. assets
	// (js, css files)
	app.use(express.static('client/build'));

	// Express will serve up index.html if
	// unknown route
	// Catchall case, only happens if all above
	// failed
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

// START SERVEREN
app.listen(port);
console.log('Magic happens on port ' + port);
