const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const indexRouter = require('./routes/index');
const googleAccountRouter = require('./routes/google-account');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/google-account', googleAccountRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
