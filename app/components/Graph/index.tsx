import * as d3 from 'd3'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { KeyOfType } from '~/types/KeyOfType'

import { brl } from '~/lib/formatting'

type BaseT = { id: string }

type GraphProps<T extends BaseT> = {
  data: T[]
  value: KeyOfType<T, number>
  name: KeyOfType<T, string>
  w?: number
  h?: number
  m?: number
} & (
  | {
      color: KeyOfType<T, string> | ((el: T) => string)
      colorStops?: never
    }
  | {
      color?: never
      colorStops: [string, string]
    }
)
// this ⬆️⬆️⬆️️ means `color` or `colorStops` must be present, not both nor neither

export default function Graph<T extends BaseT>({
  data,
  value,
  name,
  color,
  colorStops,
  h = 100,
  w = 100,
  m = 0,
}: GraphProps<T>) {
  // typescript is dumb
  const valueExtractor = (el: T): number => el[value] as number
  const nameExtractor = (el: T): string => el[name] as string

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const totalValue = useMemo(
    () => data.reduce((acc, d) => acc + valueExtractor(d), 0),
    [data],
  )

  const treatedData = data.filter((d) => valueExtractor(d) > 0)
  const r = Math.min(w, h) / 2 - m

  let pie = d3.pie<T>().value(valueExtractor).padAngle(0.03)

  let angles = pie(treatedData)

  let arcGenerator = d3
    .arc<d3.PieArcDatum<T>>()
    .innerRadius(r / 2)
    .outerRadius(r)

  const arcs = angles.map((d, i) => {
    let c

    if (color) {
      c =
        typeof color !== 'function' ? (d.data[color] as string) : color(d.data)
    } else if (colorStops) {
      c = `color-mix(in srgb, ${colorStops[0]} ${d3.scaleLinear([0, angles.length], [0, 100])(i)}%, ${colorStops[1]})`
    } else throw new Error('unreachable')

    return {
      d: arcGenerator(d)!,
      id: d.data.id,
      value: valueExtractor(d.data),
      color: c,
      name: nameExtractor(d.data),
    }
  })

  const hoveredArc = arcs.find((a) => a.id === hoveredId)

  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <InnerText {...{ hoveredArc, totalValue, r }} />

        <g transform={`translate(${w / 2}, ${h / 2})`}>
          {arcs.map((d) => (
            <path
              onMouseEnter={() => setHoveredId(d.id)}
              onMouseLeave={() => setHoveredId(null)}
              key={d.d}
              d={d.d}
              className="transition-transform hover:scale-105"
              fill={d.color}
            />
          ))}
        </g>
      </svg>
    </>
  )
}

type InnerTextProps = {
  hoveredArc?: {
    d: string
    id: string
    value: number
    color: string
    name: string
  }

  totalValue: number
  r: number
}
function InnerText({ hoveredArc, totalValue, r }: InnerTextProps) {
  const label = !!hoveredArc
  const [prevLabel, setPrevLabel] = useState(hoveredArc?.name)

  useEffect(() => {
    if (hoveredArc) {
      setPrevLabel(hoveredArc.name)
    }
  }, [hoveredArc])

  return (
    <g
      textAnchor="middle"
      dominantBaseline="middle"
      className="font-display font-semibold transition-[fill]"
      style={{
        fontSize: r * 0.7 + '%',
        fill: hoveredArc ? hoveredArc.color : 'rgb(var(--primary-300))',
      }}
    >
      <text x="50%" y="50%">
        <motion.tspan
          variants={{
            initial: { dy: '0', opacity: 0 },
            withLabel: { dy: '-0.6em', opacity: 1 },
          }}
          animate={label ? 'withLabel' : 'initial'}
          x="50%"
        >
          {prevLabel}
        </motion.tspan>
        <motion.tspan
          variants={{
            initial: { dy: '0em' },
            withLabel: { dy: '1.2em' },
          }}
          animate={label ? 'withLabel' : 'initial'}
          x="50%"
        >
          {brl(hoveredArc ? hoveredArc.value : totalValue)}
        </motion.tspan>
      </text>
    </g>
  )
}
