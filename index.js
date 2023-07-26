const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');
const { checkApiKey } = require('./middlewares/auth.handler');

const { logErrors, errorHandler, boomErrorHandler } = require('./middlewares/error.handler');

const app = express();
const port = process.env.PORT || 3200;

app.use(express.json());

const whitelist = ['http://localhost:3200', 'http://kempesmasterleague.com', 'https://kempesmasterleague.com', 'http://localhost:5173'];
const options = {
    origin: (origin, callback) => {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}

app.use(cors(options));

// require('.utils/auth');

app.get('/', checkApiKey, (req, res) => {
    res.send('Hola mi servidor de express');
});

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
