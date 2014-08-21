'use strict';

let util = require('util'),
		config = require('./config/config'),
		amqpConnectionDetails = require('amqp-connect')(config.amqp.server),
		postgresConnectionDetails = require('postgres-connect')(config.postgres.server);

function handleLogMessage(message) {
	let appId = message.properties.appId,
	 		body = message.content.toString(),
			level = message.properties.headers.level,
			date = Math.floor(Number(message.properties.timestamp) / 1000),
			q = util.format("INSERT INTO logs VALUES (DEFAULT, '%s', '%s', to_timestamp(%d), '%s');", level, appId, date, body);
	
	postgresConnectionDetails.client.queryAsync(q).then(function() {
		amqpConnectionDetails.defaultChannel.ack(message);
	});
}

amqpConnectionDetails.defaultChannel.consume(config.amqp.endpoints.logs.queueName, handleLogMessage);
