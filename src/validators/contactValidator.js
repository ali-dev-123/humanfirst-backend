const { z } = require("zod");

const NO_NUMBERS_REGEX = /^[^0-9]*$/;

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(NO_NUMBERS_REGEX, "Name should not contain numbers"),

  email: z.string().trim().email("Please enter a valid email address"),

  institution: z.string().trim().max(200).optional().or(z.literal("")),

  subject: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(NO_NUMBERS_REGEX, "Subject should not contain numbers"),

  message: z.string().trim().min(10).max(2000),
});

module.exports = {
  contactSchema,
};