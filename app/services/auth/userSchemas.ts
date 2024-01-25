import { z } from "zod";

const userSchema = z.object({
  uid: z.string().uuid(),
  email: z.string().email(),
  userName: z.string(),
});
const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const createUserSchema = z.object({
  userName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

type User = z.infer<typeof userSchema>;
type LoginUser = z.infer<typeof loginUserSchema>;
type CreateUser = z.infer<typeof createUserSchema>;

export { userSchema, loginUserSchema, createUserSchema };
export type { User, LoginUser, CreateUser };
