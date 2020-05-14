# express-tiny-session

## API

  View counter example:

```js
var express = require('express')
var session = require('express-tiny-session')
var cookieParser = require('cookie-parser')

var app = express();
var secret = 'my_secret';
app.use(cookieParser(secret))

app.use(session({
  secret:secret,
  signed:true
}))

app.use(function (req, res, next) {
  var n = req.session.views || 0
  req.session.views = ++n
  res.end(n + ' views')
})

app.listen(3000)
```
### Options

  - `name` - The cookie name. Defaults to `express:sess`.
  - `secret` - A string which will be used to signing cookie

#### Cookie Options

The options can also contain any of the follow:

  - `maxAge`: a number representing the milliseconds from `Date.now()` for expiry
  - `expires`: a `Date` object indicating the cookie's expiration date (expires at the end of session by default).
  - `path`: a string indicating the path of the cookie (`/` by default).
  - `domain`: a string indicating the domain of the cookie (no default).
  - `secure`: a boolean indicating whether the cookie is only to be sent over HTTPS (`false` by default for HTTP, `true` by default for HTTPS).
  - `secureProxy`: a boolean indicating whether the cookie is only to be sent over HTTPS (use this if you handle SSL not in your node process).
  - `httpOnly`: a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript (`true` by default).
  - `signed`: a boolean indicating whether the cookie is to be signed (`false` by default).
