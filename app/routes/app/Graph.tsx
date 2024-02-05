import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { brl } from '~/lib/formatting'
import { Wallet } from '~/services/walletService'

type GraphProps = {
  data: Wallet[]
  w?: number
  h?: number
  m?: number
}

export default function Graph({ data, h = 100, w = 100, m = 0 }: GraphProps) {
  const [hoveredWalletId, setHoveredWalletId] = useState<string | null>(null)
  const hoveredWallet = data.find((d) => d.id === hoveredWalletId)

  const totalValue = useMemo(
    () => data.reduce((acc, d) => acc + d.totalValue, 0),
    [data],
  )

  const treatedData = data.filter((d) => d.totalValue > 0)
  const r = Math.min(w, h) / 2 - m

  let pie = d3
    .pie<Wallet>()
    .value((d) => d.totalValue)
    .padAngle(0.03)

  let angles = pie(treatedData)

  let arcGenerator = d3
    .arc<d3.PieArcDatum<Wallet>>()
    .innerRadius(r / 2)
    .outerRadius(r)

  const arcs = angles.map((d) => ({
    d: arcGenerator(d)!,
    id: d.data.id,
    title: d.data.title,
    color: d.data.color,
  }))

  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`}>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          data-color={hoveredWallet?.color || 'emerald'}
          className="fill-primary-300 font-display font-semibold transition"
          style={{
            fontSize: r * 0.7 + '%',
          }}
        >
          {brl(hoveredWallet?.totalValue || totalValue)}
        </text>

        <g transform={`translate(${w / 2}, ${h / 2})`}>
          {arcs.map((d) => (
            <path
              onMouseEnter={() => setHoveredWalletId(d.id)}
              onMouseLeave={() => setHoveredWalletId(null)}
              key={d.d}
              d={d.d}
              data-color={d.color}
              className="fill-primary-600 transition-transform hover:scale-105"
            />
          ))}
        </g>
      </svg>
    </>
  )
}
