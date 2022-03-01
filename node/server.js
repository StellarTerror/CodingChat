const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');


const corsOption ={
  origin: ['http://localhost:8080', 'http://www.codingchat.net', 'https://www.codingchat.net'],
};

const apiHost = process.env.API_HOST || 'localhost';
const apiPort = process.env.API_PORT || '3000';

const app = express();
const proxy = createProxyMiddleware('/api', { target: `http://${ apiHost }:${ apiPort }/`, pathRewrite: { '^/api': '' }, ws: true, changeOrigin: true });

app
  .options('/api', cors(corsOption))
  .use(proxy)
  .use(express.static(path.join(__dirname, 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/*
app.get('/chat/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
*/

const server = app.listen(process.env.PORT || 8080);
server.on('upgrade', proxy.upgrade);
