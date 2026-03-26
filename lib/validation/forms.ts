import { z } from "zod";

export const donationSchema = z.object({
  donationType: z.enum(["one_time", "monthly"]),
  amount: z.number().min(1),
  dedicateTo: z.string().max(120).optional().or(z.literal("")),
  note: z.string().max(400).optional().or(z.literal("")),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  address: z.string().min(5).max(160),
  country: z.string().min(2).max(80),
  stateProvince: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  postalCode: z.string().min(2).max(20),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  paymentType: z.enum(["credit_card", "qpay"]),
  consentAccepted: z.boolean().refine((value) => value, {
    message: "Consent is required."
  }),
  captchaPassed: z.boolean().refine((value) => value, {
    message: "CAPTCHA confirmation is required."
  })
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000)
});

export const registerSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72)
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export type DonationFormValues = z.infer<typeof donationSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
