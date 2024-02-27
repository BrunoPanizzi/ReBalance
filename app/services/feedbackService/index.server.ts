import { db } from '../db/index.server'
import {
  Feedback as PersistanceFeedback,
  NewFeedback as PersistanceNewFeedback,
  feedback as feedbackTable,
} from '~/services/db/schema/feedback.server'
import { Options } from './feedbackTypes'

export type DomainFeedback = Omit<PersistanceFeedback, 'id'>

export type NewFeedback = {
  userName?: string
  email?: string
  message: string
  type: Options
}

class FeedbackService {
  async createFeedback(feedback: NewFeedback): Promise<DomainFeedback> {
    const [newFeedback] = await db
      .insert(feedbackTable)
      .values(feedback)
      .returning()

    return {
      type: newFeedback.type,
      email: newFeedback.email,
      message: newFeedback.message,
      userName: newFeedback.userName,
    }
  }
}

export default new FeedbackService()
