import type {
  ActionFunctionArgs,
  MetaFunction,
  TypedResponse,
} from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import {
  Form,
  Link,
  json,
  useActionData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { createPortal } from "react-dom";

import { sessionStorage } from "~/services/cookies/session.server";

import { authSerivce } from "~/services/auth/authService.server";
import { User } from "~/services/auth/userSchemas";

import { Result } from "~/types/Result";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<Result<User> | TypedResponse<Result<User>>> => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (!mode) return { ok: false, error: "Mode was not provided" };

  const formData = await request.formData();
  const userInfo = Object.fromEntries(formData);

  try {
    let response;
    if (mode === "login") {
      response = await authSerivce.login(userInfo);
    } else if (mode === "signup") {
      response = await authSerivce.createUser(userInfo);
    } else {
      return {
        ok: false,
        error: `Mode ${mode} is not supported`,
      };
    }

    session.set("jwt", response.token);
    session.set("user", response.user);

    return json(
      {
        ok: true,
        value: response.user,
      },
      {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      }
    );
  } catch (e) {
    console.log(e);
    return {
      ok: false,
      error: "Something went wrong with authService: " + (e as Error).message,
    };
  }
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  console.log("Action: ", actionData);

  return (
    <>
      <Modal />

      <div>
        <nav className="bg-gray-700 m-2 p-2 rounded flex justify-between">
          <h1 className="text-2xl text-gray-50 font-semibold">Hello, world!</h1>

          <div className="flex gap-4">
            <Link to="/app">app</Link>
            <Form>
              <button
                className="px-4 py-1 rounded bg-yellow-600 hover:scale-105 transition text-white font-bold"
                name="mode"
                value="login"
              >
                Login
              </button>
            </Form>
            <Form>
              <button
                className="px-4 py-1 rounded bg-yellow-600 hover:scale-105 transition text-white font-bold"
                name="mode"
                value="signup"
              >
                Criar conta
              </button>
            </Form>
          </div>
        </nav>
        <h2 className="text-lg text-gray-100">This is the home</h2>
      </div>
    </>
  );
}

function Modal() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = searchParams.get("mode");
  const isDoingStuff = navigation.state === "submitting";

  if (!mode) return null;

  return (
    <ClientOnly>
      {() =>
        createPortal(
          <div
            className="fixed inset-0 flex justify-center items-center bg-black/50"
            onClick={() => setSearchParams({})}
          >
            <div
              className="bg-gray-700 rounded p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                {mode === "login" ? "Entre na sua conta" : "Criar conta"}
              </h2>
              <span></span>
              <Form
                className="flex flex-col gap-2"
                method="post"
                id="auth-form"
              >
                <label>
                  <span className="block text-sm">Email</span>
                  <input
                    className="bg-gray-800 rounded px-2 py-1"
                    type="email"
                    name="email"
                  />
                </label>
                <label>
                  <span className="block text-sm">Password</span>
                  <input
                    className="bg-gray-800 rounded px-2 py-1"
                    type="password"
                    name="password"
                  />
                </label>
                <button
                  className="px-4 py-1 mt-2 rounded bg-yellow-600 hover:scale-105 transition text-white font-bold"
                  type="submit"
                >
                  {isDoingStuff
                    ? "Doing stuff..."
                    : mode === "login"
                    ? "Login"
                    : "Criar conta"}
                </button>
              </Form>
            </div>
          </div>,
          document.getElementById("modal-root")!
        )
      }
    </ClientOnly>
  );
}
