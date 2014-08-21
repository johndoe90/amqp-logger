'use strict';

module.exports = 	{
	postgres: {
		server: {
			port: 5432,
			database: 'logs',
			host: 'localhost',
			username: process.env.POSTGRES_USERNAME || 'postgres',
			password: process.env.POSTGRES_PASSWORD || 'postgres'
		}
	},

	amqp: {
		server: {
			port: 5672,
			virtualHost: '',
			host: 'localhost',
			username: process.env.AMQP_USERNAME || 'guest',
			password: process.env.AMQP_PASSWORD || 'guest'
		},

		endpoints: {
			logs: {
				queueName: 'logs',
				exchangeName: 'amq.topic',
				exchangeType: '#.logs'
			}
		}
	}
};