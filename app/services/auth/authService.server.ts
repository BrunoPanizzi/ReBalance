import { z } from "zod";

import { userSchema } from "./userSchemas";
import type { LoginUser, CreateUser } from "./userSchemas";

const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

type AuthResponse = z.infer<typeof authResponseSchema>;

// TODO: migrate database connection to here, removing need for jwt and making requests faster
class AuthService {
  async login(userInfo: LoginUser): Promise<AuthResponse> {
    const response = await fetch("http://localhost:5123/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userInfo.email,
        password: userInfo.password,
      }),
    });

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const res = await response.json();

    return authResponseSchema.parse(res);
  }

  async createUser(userInfo: CreateUser): Promise<AuthResponse> {
    const response = await fetch("http://localhost:5123/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userInfo.userName,
        email: userInfo.email,
        password: userInfo.password,
      }),
    });

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const res = await response.json();

    return authResponseSchema.parse(res);
  }
}

export const authSerivce = new AuthService();
