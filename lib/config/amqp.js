'use strict';

let Bromise = require('bluebird'),
		config = require('./config').amqp,
		initializer = require('application-initializer'),
		connectionDetails = require('amqp-connect')(config.server);

let logsEndpoint = function(options) {
	return Bromise.join(
		connectionDetails.defaultChannel.assertQueue(options.queueName, {durable: true}),
		connectionDetails.defaultChannel.assertExchange(options.exchangeName, options.exchangeType, {durable: true}),
		connectionDetails.defaultChannel.bindQueue(options.queueName, options.exchangeName, options.routingPattern)
	);
};

let setup = connectionDetails.ready.then(function() {
	return Bromise.join(
		logsEndpoint(config.endpoints.logs)
	);
});

initializer.addDependency('Setup AMQP endpoints', setup);
