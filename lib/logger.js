'use strict';

let pg = require('pg'),
 		util = require('util'),
 		amqp = require('amqplib'),
		config = require('./config'),
 		Promise = require('bluebird');
 		
let client, channel, connection,
		amqpUrl = util.format('amqp://%s:%s@%s:%d%s', config.amqp.username, config.amqp.password, config.amqp.host, config.amqp.port, config.amqp.vhost),
		postgresUrl = util.format('postgres://%s:%s@%s:%d/%s', config.postgres.username, config.postgres.password, config.postgres.host, config.postgres.port, config.postgres.database);
		
function amqpConnection() {
	if ( !amqpConnection.amqpIsSetUp ) {
		amqpConnection.amqpIsSetUp = amqp.connect(amqpUrl).then(function(con) {
			connection = con;
			return connection.createChannel();
		}).then(function(ch) {
			channel = ch;
			process.once('SIGINT', tearDownAmqpConnection);
			return Promise.all([
				channel.assertQueue(config.amqp.queue, {durable: true}),
				channel.assertExchange(config.amqp.exchange, 'topic', {durable: true}),
				channel.bindQueue(config.amqp.queue, config.amqp.exchange, config.amqp.routingPattern)
			]);
		});
	}

	return amqpConnection.amqpIsSetUp;
}

function tearDownAmqpConnection() {
	channel.close().finally(function() {
		connection.close();
	});
}

function initializeDatabase() {
	let q = 'CREATE TABLE IF NOT EXISTS logs (id bigserial primary key, level varchar(10) NOT NULL, appId varchar(32) NOT NULL, date timestamp NOT NULL, message text NOT NULL);';
	return client.queryAsync(q);
}

function postgresConnection() {
	if ( !postgresConnection.postgresIsSetUp )  {
		client = Promise.promisifyAll(new pg.Client(postgresUrl));
		postgresConnection.postgresIsSetUp = client.connectAsync().then(function() {
			process.once('SIGINT', tearDownPostgresConnection);
			return initializeDatabase();
		});
	}
	
	return postgresConnection.postgresIsSetUp;	
}

function tearDownPostgresConnection() {
	client.end();
}

function ready() {
	return Promise.all([postgresConnection(), amqpConnection()]);
}

function handleLogMessage(message) {
	let appId = message.properties.appId,
	 		body = message.content.toString(),
			level = message.properties.headers.level,
			date = Math.floor(Number(message.properties.timestamp) / 1000),
			q = util.format("INSERT INTO logs VALUES (DEFAULT, '%s', '%s', to_timestamp(%d), '%s');", level, appId, date, body);
	
	client.queryAsync(q).then(function() {
		channel.ack(message);
	});
}

ready().then(function() {
	channel.consume(config.amqp.queue, handleLogMessage);
});
