const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
app.use(bodyParser.json());

// Routes
const collectionRoutes = require('./routes/collections');
app.use('/collections', collectionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
