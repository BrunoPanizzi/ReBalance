import { z } from "zod";

import { userSchema, loginUserSchema, createUserSchema } from "./userSchemas";
import type { User, LoginUser, CreateUser } from "./userSchemas";

const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

// TODO: migrate database connection to here, removing need for jwt and making requests faster
class AuthService {
  async login(
    userInfo: unknown | LoginUser
  ): Promise<z.infer<typeof authResponseSchema>> {
    const data = loginUserSchema.parse(userInfo);

    const response = await fetch("http://localhost:5123/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log(response.status);

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const res = await response.json();

    console.log("Response: ", res);

    return authResponseSchema.parse(res);
  }

  async createUser(
    userInfo: unknown
  ): Promise<z.infer<typeof authResponseSchema>>;
  async createUser(
    userInfo: CreateUser
  ): Promise<z.infer<typeof authResponseSchema>> {
    const data = createUserSchema.parse(userInfo);

    const response = await fetch("http://localhost:5123/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: data.userName,
        email: data.email,
        password: data.password,
      }),
    });

    console.log(response.status);

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const res = await response.json();

    return authResponseSchema.parse(res);
  }

  // async getCurrentUser(request: Request): Promise<User | null> {
  //   const user = await this.authenticator.isAuthenticated(request);
  //   const parsed = userSchema.safeParse(user);

  //   if (parsed.success) {
  //     return parsed.data;
  //   }

  //   console.warn("[WARNING]: Could not parse user data from the backend.");
  //   console.warn("Data:", user);

  //   return null;
  // }

  // async logout(request: Request, redirectTo = "/") {
  //   return await this.authenticator.logout(request, { redirectTo });
  // }
}

export const authSerivce = new AuthService();
