/**
 * Module dependencies.
 * @private
 */

const debug = require('debug')('express-tiny-session');
const onHeaders = require('on-headers');

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

module.exports = function (opts = { }) {
	const name = opts.name || 'express:sess';

	// defaults
	if (null == opts.overwrite)
		opts.overwrite = true;

	if (null == opts.httpOnly)
		opts.httpOnly = true;

	if (null == opts.signed)
		opts.signed = true;

	if (!opts.secret && opts.signed)
		throw new Error('secret key required.');

	debug('session options %j', opts);

	return function cookieSession(req, res, next) {
		let session = {};
		const cookieVal = opts.secret ? req.signedCookies[name] : req.cookies[name];
		let data = null;
		if (cookieVal) {
			try {
				session = decode(cookieVal);
				data = JSON.parse(JSON.stringify(session));
			} catch (err) { /* */ }

			if (Object.prototype.toString.call(session) !== '[object Object]') {
				session = {};
			}
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
			} else if (JSON.stringify(data) !== JSON.stringify(this.req.session)) {
				debug('store session %j', this.req.session);
				this.cookie(name, encode(this.req.session), opts);
			}
		});
		req.session = session;
		next();
	};
};


/**
 * Decode the base64 cookie value to an object.
 *
 * @param {String} string
 * @return {Object}
 * @private
 */

function decode(string) {
	const body = Buffer.from(string, 'base64').toString('utf8');
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
	return Buffer.from(body).toString('base64');
}