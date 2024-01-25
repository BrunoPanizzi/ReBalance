import { z } from "zod";
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
import type { User } from "~/services/auth/userSchemas";

import { Result } from "~/types/Result";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "Stock shop" },
    { name: "description", content: "Welcome to Stock shop!" },
  ];
};

const loginFormValidator = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});
const signupFormValidator = loginFormValidator.extend({
  userName: z.string().min(1, "Nome de usuário é obrigatório"),
});

type AuthError = {
  type: string | "email" | "password" | "backend" | "unknown";
  error: string;
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<TypedResponse<Result<User, AuthError[]>>> => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (!mode || (mode !== "login" && mode !== "signup"))
    return json({
      ok: false,
      error: [
        {
          type: "unknown",
          error: "Invalid mode",
        },
      ],
    });

  const formData = await request.formData();
  const rawForm = Object.fromEntries(formData);

  try {
    let response;

    if (mode === "login") {
      const userInfo = loginFormValidator.safeParse(rawForm);

      if (!userInfo.success) {
        return json({
          ok: false,
          error: userInfo.error.errors.map((e) => ({
            type: e.path.join("."),
            error: e.message,
          })),
        });
      }

      response = await authSerivce.login(userInfo.data);
    } else if (mode === "signup") {
      const userInfo = signupFormValidator.safeParse(rawForm);

      if (!userInfo.success) {
        return json({
          ok: false,
          error: userInfo.error.errors.map((e) => ({
            type: e.path.join("."),
            error: e.message,
          })),
        });
      }

      response = await authSerivce.createUser(userInfo.data);
    } else throw new Error("Unreachable");

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
    console.log("Backend error");
    return json({
      ok: false,
      error: [
        {
          type: "backend",
          error: "Something went wrong when authenticating",
        },
      ],
    });
  }
};

export default function Index() {
  return (
    <>
      <Modal />

      <div>
        <nav className="bg-gray-700 m-2 p-2 rounded flex justify-between">
          <h1 className="text-2xl text-gray-50 font-semibold">Hello, world!</h1>

          <div className="flex gap-4">
            <Link to="/app">app</Link>
            <Form>
              <Button
                // className="px-4 py-1 rounded bg-yellow-600 hover:scale-105 transition text-white font-bold"
                name="mode"
                value="login"
              >
                Login
              </Button>
            </Form>
            <Form>
              <Button
                // className="px-4 py-1 rounded bg-yellow-600 hover:scale-105 transition text-white font-bold"
                name="mode"
                value="signup"
              >
                Criar conta
              </Button>
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
  const hasError = actionData?.ok === false && !isDoingStuff;
  const backendError =
    hasError && actionData.error.some((e) => e.type === "backend");

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
              <header className=" mb-4">
                <h2 className="text-xl font-bold">
                  {mode === "login" ? "Entre na sua conta" : "Criar conta"}
                </h2>
                <Button
                  // className="text-sm hover:underline text-yellow-50"
                  onClick={() => {
                    setSearchParams({
                      mode: mode === "login" ? "signup" : "login",
                    });
                  }}
                >
                  {mode === "login"
                    ? "Não possui conta? Crie uma"
                    : "Já é usuário? Faça login"}
                </Button>
              </header>
              <Form
                className="flex flex-col gap-2"
                noValidate
                method="post"
                id="auth-form"
              >
                {mode === "signup" && (
                  <label>
                    <span className="block text-sm">Username</span>
                    <ErrorLabel
                      field="userName"
                      errors={hasError ? actionData.error : undefined}
                    />
                    <input
                      className="bg-gray-800 rounded px-2 py-1"
                      name="userName"
                    />
                  </label>
                )}
                <label>
                  <span className="block text-sm">Email</span>
                  <ErrorLabel
                    field="email"
                    errors={hasError ? actionData.error : undefined}
                  />
                  <input
                    autoCorrect="off"
                    className="bg-gray-800 rounded px-2 py-1"
                    type="email"
                    name="email"
                  />
                </label>
                <label>
                  <span className="block text-sm">Password</span>
                  <ErrorLabel
                    field="password"
                    errors={hasError ? actionData.error : undefined}
                  />
                  <input
                    className="bg-gray-800 rounded px-2 py-1"
                    type="password"
                    name="password"
                  />
                </label>

                {backendError && (
                  <span className="text-sm text-red-400">
                    Algo deu errado ao{" "}
                    {mode === "login" ? "entrar" : "criar conta"}
                    <br />
                    Verifique se os dados inseridos estão corretos
                  </span>
                )}
                {actionData?.ok && (
                  <span className="text-sm text-green-400">
                    {mode === "login"
                      ? "Login efetuado com sucesso!"
                      : "Conta criada com sucesso!"}
                  </span>
                )}

                <Button
                  // className="px-4 py-1 mt-2 rounded bg-yellow-600 hover:scale-105 transition text-white font-bold"
                  type="submit"
                >
                  {isDoingStuff
                    ? "Doing stuff..."
                    : mode === "login"
                    ? "Login"
                    : "Criar conta"}
                </Button>
              </Form>
            </div>
          </div>,
          document.getElementById("modal-root")!
        )
      }
    </ClientOnly>
  );
}

function ErrorLabel({
  field,
  errors,
}: {
  field: string;
  errors?: AuthError[];
}) {
  if (!errors) return null;

  const error = errors.find((e) => e.type === field);

  if (!error) return null;

  const message = error.error;

  return <span className="text-red-400 text-sm block pb-1">{message}</span>;
}
