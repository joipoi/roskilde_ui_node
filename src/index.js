const express = require('express');
const { createServer } = require('http');
const getRouter = require('./routes/getRoutes');
const postRouter = require('./routes/postRoutes');
const {configureMiddleware, sessionMiddleware} = require('./middleware');

const app = express();
configureMiddleware(app);
const server = createServer(app);

app.use('/', getRouter);
app.use('/', postRouter);

const port = process.env.PORT;

  // Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});