import { createCookieSessionStorage } from "@remix-run/node";
import { User } from "../auth/userSchemas";

export type SessionData = {
  jwt: string;
  user: User;
};

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: false,
    secrets: ["supersecret"],
    secure: process.env.NODE_ENV === "production",
  },
});
