
/**
 * Module dependencies.
 * @private
 */

var debug = require('debug')('express-tiny-session');
var onHeaders = require('on-headers');
var _ = require("lodash");

/**
 * Create a new cookie session middleware.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.httpOnly]
 * @param {string} [opts.name=express:sess] Name of the cookie to use
 * @param {boolean} [opts.overwrite]
 * @param {string} [opts.secret]
 * @param {boolean} [opts.signed]
 * @return {function} middleware
 * @public
 */

module.exports = function(opts){
	opts = opts || {};

	var name = opts.name || 'express:sess';

	// defaults
	if (null == opts.overwrite) opts.overwrite = true;
	if (null == opts.httpOnly) opts.httpOnly = true;
	if (null == opts.signed) opts.signed = true;

	if (!opts.secret && opts.signed) throw new Error('secret key required.');

	debug('session options %j', opts);

  return function cookieSession(req, res, next){
	var session = {},
		cookieVal = opts.secret ? req.signedCookies[name] : req.cookies[name],
		data = null;
	if(cookieVal){
		try {
			session = decode(cookieVal);
			data = _.cloneDeep(session);
		}
		catch (err){
		}
		if(!_.isObject(session))
			session = {};
	}
	onHeaders(res, function setHeaders() {
		if (this.req.session === undefined) {
			// not accessed
			return;
		}
		if (this.req.session === false) {
			// remove
			debug('clear session');
			this.clearCookie(name);
		} else if (!_.isEqual(data,this.req.session)) {
			debug('store session %j',this.req.session);
			this.cookie(name,encode(this.req.session),opts);
		}
	});
	req.session = session;
	next();
  }
};


/**
 * Decode the base64 cookie value to an object.
 *
 * @param {String} string
 * @return {Object}
 * @private
 */

function decode(string) {
  var body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

/**
 * Encode an object into a base64-encoded JSON string.
 *
 * @param {Object} body
 * @return {String}
 * @private
 */

function encode(body) {
  body = JSON.stringify(body);
  return new Buffer(body).toString('base64');
}
