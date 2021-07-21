import { Timestamp } from '@google-cloud/firestore'
import { FieldValue } from 'react-hook-form'

export interface NewPoll {
  title: string
  options: Timestamp[]
  submissions: Submission[]
  active: boolean
  hidden: boolean
  created: FieldValue<Timestamp>
  location?: string
  link?: string
  askForContactDetails?: boolean
}

export default interface Poll extends NewPoll {
  created: Timestamp
  creatorID?: string
  id: string
}

export interface Submission {
  name: string
  options: number[]
  active: boolean
  email?: string
}
