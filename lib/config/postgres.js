'use strict';

let config = require('./config').postgres,
		initializer = require('application-initializer'),
		connectionDetails = require('postgres-connect')(config.server);

let setup = connectionDetails.ready.then(function() {
	let q = 'CREATE TABLE IF NOT EXISTS logs (' + 
						'id bigserial primary key, ' + 
						'level varchar(10) NOT NULL, ' + 
						'appId varchar(32) NOT NULL, ' +
						'date timestamp NOT NULL, ' +
						'message text NOT NULL);';
	
	return connectionDetails.client.queryAsync(q);
});

initializer.addDependency('Setup Postgres Table', setup);


