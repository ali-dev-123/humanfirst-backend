const prisma = require("../config/prisma");
const { appendContactMessage } = require("../config/googleSheets");

const submitContactForm = async (req, res) => {
  try {
    const {
      name,
      email,
      institution,
      subject,
      message,
    } = req.body;

    // Save to existing database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    // Save to Google Sheets
    await appendContactMessage({
      name,
      email,
      institution: institution || "",
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      contact,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit contact form",
    });
  }
};

module.exports = {
  submitContactForm,
};