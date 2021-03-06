/**
 * Verifier process
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This is just an asynchronous implementation of a verifier for a
 * signed key, because Node.js's crypto functions are synchronous,
 * strangely, considering how everything else is asynchronous.
 *
 * I wrote this one day hoping it would help with performance, but
 * I don't think it had any noticeable effect.
 *
 * @license MIT license
 */

// Because I don't want two files, we're going to fork ourselves.

var fakeProcess = new (require('./fake-process').FakeProcess)();
//if (!process.send) {

	// This is the parent

	var guid = 1;
	var callbacks = {};
	var callbackData = {};

	//var child = require('child_process').fork('verifier.js');
	exports.verify = function(data, signature, callback) {
		var localGuid = guid++;
		callbacks[localGuid] = callback;
		callbackData[localGuid] = data;
		fakeProcess.server.send({data: data, sig: signature, guid: localGuid});
	};
	fakeProcess.server.on('message', function(response) {
		if (callbacks[response.guid]) {
			callbacks[response.guid](response.success, callbackData[response.guid]);
			delete callbacks[response.guid];
			delete callbackData[response.guid];
		}
	});

//} else {

	// This is the child

	var config = require('./config/config.js');
	var crypto = require('crypto');

	var keyalgo = config.loginserverkeyalgo;
	var pkey = config.loginserverpublickey;

	fakeProcess.client.on('message', function(message) {
		var verifier = crypto.createVerify(keyalgo);
		verifier.update(message.data);
		var success = false;
		try {
			success = verifier.verify(pkey, message.sig, 'hex');
		} catch (e) {}
		fakeProcess.client.send({
			success: success,
			guid: message.guid
		});
	});

//}
