/**
 * List of available colors for the app's wallets themes.
 * Based on TailwindCSS's color palette.
 */

import { z } from 'zod'

const colors = [
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const

export const colorsSchema = z.enum(colors)

export type Colors = z.infer<typeof colorsSchema>
