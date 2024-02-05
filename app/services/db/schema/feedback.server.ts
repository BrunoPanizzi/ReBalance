import { pgTable, text, uuid, varchar, pgEnum } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const feedbackTypeSchema = z.enum([
  'Elogios',
  'Sugestão',
  'Problemas',
  'Outros',
])

export const feedbackType = pgEnum('feedback_type', feedbackTypeSchema.options)

export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  type: feedbackType('type').notNull().default('Outros'),
  message: text('message').notNull(),
  userName: varchar('user_name', { length: 100 }),
  email: varchar('email', { length: 200 }),
})

export const feedbackSchema = createSelectSchema(feedback, {
  id: z.string().uuid().min(1),
  type: feedbackTypeSchema,
  message: z.string().min(1),
  userName: z.string().nullable(),
  email: z.string().email().nullable(),
})

export const newFeedbackSchema = createInsertSchema(feedback, {
  type: feedbackTypeSchema,
  message: z.string().min(1),
  userName: z.string().nullable(),
  email: z.string().email().nullable(),
})

export type Feedback = z.infer<typeof feedbackSchema>
export type NewFeedback = z.infer<typeof newFeedbackSchema>
