import { z } from "zod";

export class RegisterDTO {
  static Register = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  static RegisterResponse = z.object({
    success: z.boolean().optional(),
    errors: z
      .record(z.string())
      .optional()
      .nullable(),
    values: z
      .object({
        name: z.string().nullable(),
        email: z.string().nullable(),
      })
      .optional(),
  });
}

export type RegisterDto = z.infer<typeof RegisterDTO.Register>;
export type RegisterResponseDto = z.infer<typeof RegisterDTO.RegisterResponse>;
