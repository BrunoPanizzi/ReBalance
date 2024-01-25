import { Link } from "@remix-run/react";
import { type Wallet } from "~/services/walletService";

export type WalletProps = {
  wallet: Wallet;
};

export default function Wallet(props: WalletProps) {
  return (
    <Link to={`/app/${props.wallet.id}`}>
      <div className="border border-gray-500/30 hover:border-gray-500 transition min-w-96 w-fit rounded p-2 my-2">
        <h1 className="text-2xl text-gray-50 font-semibold">
          {props.wallet.title}
        </h1>
        <h2 className="text-lg text-gray-100">{props.wallet.totalValue}</h2>
      </div>
    </Link>
  );
}
