const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build'))).use('/api', createProxyMiddleware('/api', { target: 'http://127.0.0.1:3000', pathRewrite: { '^/api': '' }, ws: true }));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/*
app.get('/chat/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
*/

app.listen(process.env.PORT || 8080);