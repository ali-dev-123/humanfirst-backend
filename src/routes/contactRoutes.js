const express = require("express");

const {
  submitContactForm,
} = require("../controllers/contactController");

const validate = require("../middleware/validate");

const {
  contactSchema,
} = require("../validators/authValidator");

const router = express.Router();

// Submit contact form
router.post(
  "/",
  validate(contactSchema),
  submitContactForm
);

module.exports = router;