import { Timestamp } from '@google-cloud/firestore'

export interface NewPoll {
  title: string
  options: Timestamp[]
  submissions: Submission[]
  active: boolean
  hidden: boolean
  created: any
}

export default interface Poll extends NewPoll {
  created: Timestamp
  id: string
}

export interface Submission {
  name: string
  options: number[]
  active: boolean
}
