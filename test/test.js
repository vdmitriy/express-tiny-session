process.env.NODE_ENV = 'test';

const assert = require('assert');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const session = require('..');

describe('Express Tiny Session', function(){
	const msg = 'tiny-session', msg2 = 'tiny-session-modified', secret = 'mysecret';
	describe('store in not signed cookie', function(){
		const app = App({signed:false});
		app.get('/set', function(req, res){
			req.session.message = msg;
			res.send();
		});
		app.get('/get', function(req, res){
			res.send(req.session.message);
		});
		app.get('/modify', function(req, res){
			req.session.message = msg2;
			res.send();
		});
		app.get('/get-modified', function(req, res){
			res.send(req.session.message);
		});
		app.get('/clear', function(req, res){
			req.session = false;
			res.send();
		});
		app.get('/get-cleared', function(req, res){
			res.send(req.session.message);
		});
		const agent = request.agent(app);

		it('set session', function(done){
			agent
			.get('/set')
			.expect(function(res){
				assert.equal(res.headers['set-cookie'][0],'express:sess=eyJtZXNzYWdlIjoidGlueS1zZXNzaW9uIn0%3D; Path=/; HttpOnly');
			})
			.end(done);
		});
		it('get session', function(done){
			agent
			.get('/get')
			.expect(function(res){
				assert.equal(res.text,msg);
			})
			.end(done);
		});
		it('modify session', function(done){
			agent
			.get('/modify')
			.expect(function(res){
				assert.equal(res.headers['set-cookie'][0],'express:sess=eyJtZXNzYWdlIjoidGlueS1zZXNzaW9uLW1vZGlmaWVkIn0%3D; Path=/; HttpOnly');
			})
			.end(done);
		});
		it('get modified session', function(done){
			agent
			.get('/get-modified')
			.expect(function(res){
				assert.equal(res.text,msg2);
			})
			.end(done);
		});
		it('clear session', function(done){
			agent
			.get('/clear')
			.expect(function(res){
				assert(/express:sess=; Path=\/; Expires=.*/.test(res.headers['set-cookie'][0]));
			})
			.end(done);
		});
		it('get cleared session', function(done){
			agent
			.get('/get-cleared')
			.expect(function(res){
				assert.equal(res.text,'');
			})
			.end(done);
		});
	});
	describe('store in signed cookie', function(){
		const app = App({secret});
		app.get('/', function(req, res){
			req.session.message = msg;
			res.send();
		});
		app.get('/session', function(req, res){
			res.send(req.session.message);
		});
		const agent = request.agent(app);

		it('set session', function(done){
			agent
			.get('/')
			.expect(function(res){
				assert.equal(res.headers['set-cookie'][0],'express:sess=s%3AeyJtZXNzYWdlIjoidGlueS1zZXNzaW9uIn0%3D.tcMXHd%2B0gu7BSkzxFgaIrT%2F22rgAxCLVqbsPP%2FrNsYQ; Path=/; HttpOnly');
			})
			.end(done);
		});
		it('get session', function(done){
			agent
			.get('/session')
			.expect(function(res){
				assert.equal(res.text,msg);
			})
			.end(done);
		});
	});
});

function App(options) {
	options = options || {};
	const app = express();
	if(options.secret)
		app.use(cookieParser(options.secret));
	else
		app.use(cookieParser());

	app.use(session(options));
	return app;
}
