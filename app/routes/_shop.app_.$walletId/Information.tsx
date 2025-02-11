import { useLoaderData } from 'react-router';
import { useState } from 'react'
import colors from 'tailwindcss/colors.js'

import Graph from '~/components/Graph'

import Investing from './Investing'
import { loader } from './loader'

export default function Information() {
  const [selected, setSelected] = useState<'invest' | 'graph'>('invest')

  return (
    <div className="h-min overflow-hidden rounded-lg bg-gray-700/50">
      <menu
        className="flex justify-center gap-1 bg-gray-700 px-3 py-1"
        type="toolbar"
      >
        <li
          data-selected={selected === 'invest'}
          className="rounded px-3 py-1 transition-colors hover:bg-primary-400/25 data-[selected=true]:bg-primary-600/50 data-[selected=true]:text-primary-50 data-[selected=true]:shadow"
        >
          <button onClick={() => setSelected('invest')}>Investir</button>
        </li>
        <li
          data-selected={selected === 'graph'}
          className="rounded px-3 py-1 transition-colors hover:bg-primary-400/25 data-[selected=true]:bg-primary-600/50 data-[selected=true]:text-primary-50 data-[selected=true]:shadow"
        >
          <button onClick={() => setSelected('graph')}>Gráfico</button>
        </li>
      </menu>

      <main className="p-3">
        {selected === 'invest' && <Investing />}
        {selected === 'graph' && <PieChart />}
      </main>
    </div>
  )
}

function PieChart() {
  const { assets, color } = useLoaderData<typeof loader>()

  return (
    <Graph
      data={assets}
      value="totalValue"
      name="name"
      colorStops={[colors[color][200], colors[color][700]]}
      h={50}
    />
  )
}
