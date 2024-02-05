import { pgEnum } from 'drizzle-orm/pg-core'

import { colorsSchema } from '~/constants/availableColors'

export const pgColorEnum = pgEnum('color', colorsSchema.options)

export { colorsSchema }
