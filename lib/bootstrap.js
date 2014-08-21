'use strict';

let amqp = require('./config/amqp'),
		postgres = require('./config/postgres'),
		initializer = require('application-initializer');

initializer.initialize().then(function() {
	require('./logger');
}, function(err) {
	console.log('An Error occured: ' + err);
	process.exit();
});