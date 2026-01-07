import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, { error: "Name can't must be less than 3" }),
  email: z.email({ error: "Email is required" }),
  password: z
    .string()
    .min(6, { error: "Name must be at least 6 characters long." }),
});

export const loginSchema = z.object({
  email: z.email({ error: "Email is required" }),
  password: z.string().min(1, { error: "Password is required" }),
});
