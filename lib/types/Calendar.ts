import { Dayjs } from 'dayjs'

export type Color = {
  main: string
  secondary: string
}

export type CalendarTheme = {
  active: Color
  background: string
  inactive: Color
  text: string
}

export type Data = Month[]

export type Month = {
  name: string
  weeks: Week[]
}

export type Week = CBlock[]

export type CBlock = {
  date: Dayjs
  isActive: boolean
  isInMonth: boolean
}

export type CalendarProps = {
  blockMargin?: number
  blockSize?: number
  dates: Dayjs[]
  theme?: CalendarTheme
  setActiveDate?: (date: Dayjs | undefined) => void
}
