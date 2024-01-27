import { Link } from '@remix-run/react'
import { type Wallet } from '~/services/walletService'

export type WalletProps = {
  wallet: Wallet
}

export default function Wallet(props: WalletProps) {
  return (
    <Link to={`/app/${props.wallet.id}`}>
      <div className="my-2 w-fit min-w-96 rounded border border-gray-500/30 p-2 transition hover:border-gray-500">
        <h1 className="text-2xl font-semibold text-gray-50">
          {props.wallet.title}
        </h1>
        <h2 className="text-lg text-gray-100">{props.wallet.totalValue}</h2>
      </div>
    </Link>
  )
}
