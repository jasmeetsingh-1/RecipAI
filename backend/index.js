const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const router = require("./src/router");
const { secretKeyValidator } = require("./src/validator/request-validator");
// const connectionMongo = require("./src/database/connection");

// connectionMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  callback(null, corsOptions);
};

app.use("/ra-api", cors(corsOptionsDelegate),secretKeyValidator, router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});