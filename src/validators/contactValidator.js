const { z } = require("zod");

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().email("Please enter a valid email address"),

  institution: z.string().trim().max(200).optional().or(z.literal("")),

  subject: z.string().trim().min(3).max(200),

  message: z.string().trim().min(10).max(2000),
});

module.exports = {
  contactSchema,
};