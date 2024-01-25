import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { sessionStorage } from "~/services/cookies/session.server";

import WalletService, { type Wallet as W } from "~/services/walletService";

import Wallet from "~/components/Wallet";
import { authSerivce } from "~/services/auth/authService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const token = session.get("jwt");

  if (!token) {
    console.log("Anonymous user tried to access /app");

    throw redirect("/");
  }

  return json(await WalletService.getWallets(token));
};

export default function App() {
  const wallets = useLoaderData<typeof loader>();

  console.log(wallets);

  return (
    <div>
      <h1 className="text-2xl text-gray-50 font-semibold">This is the app</h1>

      <hr className="border-t-2 border-dashed border-gray-600 my-3" />

      <div>
        {wallets.map((w) => (
          <Wallet wallet={w} key={w.id} />
        ))}
      </div>

      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  );
}
