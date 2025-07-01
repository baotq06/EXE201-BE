require("dotenv").config();
require("module-alias/register");
const express = require("express");
const cors = require("cors");
const app = express();
const slipController = require('../controllers/slip.controller');
const { auth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const slipRouter = express.Router();

slipRouter.get('/:type/:id', validate(), slipController.downloadSlip);
// exportSlipRouter.get('/', auth, validate(exportSlipValidation.getExportSlipByType), exportSlipController.getExportSlipByType);

module.exports = slipRouter;
