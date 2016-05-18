var redisHelper = require('./redisHelper');
var tokenHelper = require('./tokenHelper');
var TIME_TO_LIVE = 60*60*24; //24 hours
exports.createAndStoreToken = function(data, ttl, callback) {
	data = data || {};
	ttl = ttl || TIME_TO_LIVE;

	if (data != null && typeof data !== 'object') callback(new Error('data is not an Object'));
	if (ttl != null && typeof ttl !== 'number') callback(new Error('ttl is not a valid Number'));

	tokenHelper.createToken(function(err, token) {
		if (err) callback(err);

		redisHelper.setTokenWithData(token, data, ttl, function(err, success) {
			if (err) callback(err);

			if (success) {
				callback(null, token);
			}
			else {
				callback(new Error('Error when saving token'));
			}
		});
	});
};

/*
* Expires the token (remove from redis)
*/
exports.expireToken = function(headers, callback) {
	if (headers == null) callback(new Error('Headers are null'));
	// Get token
	try {
		var token = tokenHelper.extractTokenFromHeader(headers);

		if (token == null) callback(new Error('Token is null'));

		redisHelper.expireToken(token, callback);
	} catch (err) {
		console.log(err);
		return callback(err);
	}	
}