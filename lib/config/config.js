'use strict';

let config = module.exports = {
	postgres: {
		port: 5432,
		database: 'logs',
		host: 'localhost',
		username: process.env.POSTGRES_USERNAME || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres'
	},

	amqp: {
		vhost: '',
		port: 5672,
		host: 'localhost',
		username: process.env.AMQP_USERNAME || 'guest',
		password: process.env.AMQP_PASSWORD || 'guest',

		queue: 'logs',
		exchange: 'amq.topic',
		routingPattern: '*.logs'
	}
};
