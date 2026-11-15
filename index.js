require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });

const fs = require('fs');
const path = require('path');
const express = require('express');
const config = require('./scripts/configuration');
const state = require('./scripts/state');
const routes = require('./scripts/routes');
const { ApiError } = require('./scripts/errors');

console.log(`SevDesk-Extension for Theologische Fernschule e.V. running on Version: ${config.version}`);

state.load();

const app = express();
app.disable('x-powered-by');

if (config.corsOrigin) app.use(require('cors')({ origin: config.corsOrigin }));

app.use('/api', express.json({ limit: '1mb' }), routes);

// Serve the built web frontend (SPA) if it is available.
if (config.clientPath && fs.existsSync(path.join(config.clientPath, 'index.html'))) {
    app.use(express.static(config.clientPath));
    app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(config.clientPath, 'index.html')));
    console.log(`Serving web frontend from ${config.clientPath}`);
} else {
    console.log('No built web frontend found, serving the API only');
}

// Uniform error responses, see API.md.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Der Request-Body ist kein gültiges JSON.' } });
    }
    if (err.type === 'entity.too.large') {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Der Request-Body ist zu groß.' } });
    }
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler auf dem Server.' } });
});

app.listen(config.port, () => console.log(`Server running on Port ${config.port}`));
