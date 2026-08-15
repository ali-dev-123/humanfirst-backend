const prisma = require("../config/prisma");
const { appendContactMessage, checkEmailExists } = require("../config/googleSheets");

const submitContactForm = async (req, res) => {
  try {
    const {
      name,
      email,
      institution,
      subject,
      message,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Step 1 — check database first (fast, local check)
    const existingContact = await prisma.contact.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_EMAIL",
        message: "This email has already submitted a message. We'll be in touch soon.",
      });
    }

    // Step 2 — check Google Sheets as a second safety layer
    const alreadyInSheet = await checkEmailExists(normalizedEmail);

    if (alreadyInSheet) {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_EMAIL",
        message: "This email has already submitted a message. We'll be in touch soon.",
      });
    }

    // Save to database
    const contact = await prisma.contact.create({
      data: {
        name,
        email: normalizedEmail,
        subject,
        message,
      },
    });

    // Save to Google Sheets
    await appendContactMessage({
      name,
      email: normalizedEmail,
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
    // Handle the rare race-condition case: DB unique constraint caught it
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_EMAIL",
        message: "This email has already submitted a message. We'll be in touch soon.",
      });
    }

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