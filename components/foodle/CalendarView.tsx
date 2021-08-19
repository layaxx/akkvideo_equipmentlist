import React, { useState, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import Box from '@material-ui/core/Box'
import {
  Data,
  Week,
  Month,
  CalendarTheme,
  CalendarProps,
  CBlock,
} from 'lib/types/Calendar'

function generateData(dates: Dayjs[]) {
  dates = dates.map((d) => d.set('hour', 0).set('minute', 0))

  const data: Data = []

  let activeDate = dates[0].set('dates', 1)
  const endDate = dates[dates.length - 1]

  while (!activeDate.isAfter(endDate)) {
    data.push(generateMonth(activeDate, dates))
    activeDate = activeDate.add(1, 'month')
  }

  return data
}

function generateMonth(start: Dayjs, dates: Dayjs[]) {
  const monthNumber = start.get('month')
  const name = start.format("MMMM 'YY")

  // go to start of month
  start = start.set('date', 1)
  // go to Monday
  start = start.set('day', 1)

  const weeks: Week[] = []
  let counter = 0
  for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
    const week = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const newDate = start.add(counter, 'days')
      week.push({
        date: newDate,
        isActive: !!dates.find((date) => date.isSame(newDate, 'day')),
        isInMonth: monthNumber === newDate.get('month'),
      })
      counter++
    }

    weeks.push(week)
  }

  return { weeks, name }
}

const DEFAULT_THEME: CalendarTheme = {
  background: 'transparent',
  text: '#000',
  active: { main: '#ffbf00', secondary: '#e9d66b' },
  inactive: { main: '#6e7f80', secondary: '#b2beb5' },
  today: { main: '#8bc34a', secondary: '#afcc8e' },
}

const DATE_FORMAT = 'YYYY-MM-DD'

const CalendarView: React.FC<CalendarProps> = ({
  blockMargin = 2,
  blockSize = 20,
  theme = undefined,
  dates = [],
  setActiveDate = undefined,
}) => {
  const [data, setData] = useState<Data | undefined>(undefined)

  function getTheme(): CalendarTheme {
    if (theme) {
      return Object.assign({}, DEFAULT_THEME, theme)
    }

    return DEFAULT_THEME
  }

  function getDimensions() {
    const newWidth = (blockSize + blockMargin) * 7
    const newHeight = (blockSize + blockMargin) * (5 + 1)

    return { width: newWidth, height: newHeight }
  }

  function renderMonth({ weeks }: Month) {
    const themeToBeUsed = getTheme()

    function colorLookup({ isActive, isInMonth }: CBlock) {
      if (isActive && isInMonth) {
        return themeToBeUsed.active.main
      }
      if (isActive && !isInMonth) {
        return themeToBeUsed.active.secondary
      }
      if (!isActive && isInMonth) {
        return themeToBeUsed.inactive.main
      }
      return themeToBeUsed.inactive.secondary
    }

    return (
      <>
        <g>
          {weeks[0].map((day, index) => (
            <text
              y={blockSize / 1.5}
              x={blockSize / 2 + (blockSize + blockMargin) * index}
              width={blockSize}
              height={blockSize}
              key={day.date.format(DATE_FORMAT)}
              fill={themeToBeUsed.text}
              dominantBaseline="middle"
              textAnchor="middle"
              style={{ font: `${blockSize * 0.75}px sans-serif` }}
            >
              {day.date.format('dd')[0]}
            </text>
          ))}
        </g>

        {weeks
          .map((week) =>
            week.map((day, index) => {
              if (day.date.isSame(dayjs(), 'day')) {
                return (
                  <circle
                    key="today"
                    cy="0"
                    cx={(blockSize + blockMargin) * index}
                    r={blockSize / 2}
                    fill={colorLookup(day)}
                    transform={`translate(${blockSize / 2} ${blockSize / 2})`}
                  />
                )
              } else {
                let mouseHandlers = {}
                if (day.isActive && setActiveDate) {
                  mouseHandlers = {
                    onMouseOver: () => setActiveDate(day.date),
                    onMouseOut: () => setActiveDate(undefined),
                  }
                }
                return (
                  <rect
                    y="0"
                    x={(blockSize + blockMargin) * index}
                    width={blockSize}
                    height={blockSize}
                    fill={colorLookup(day)}
                    key={day.date.format(DATE_FORMAT)}
                    {...mouseHandlers}
                  />
                )
              }
            })
          )
          .map((week, x) => (
            <g
              key={x}
              transform={`translate(0, ${(blockSize + blockMargin) * (1 + x)})`}
            >
              {week}
            </g>
          ))}
      </>
    )
  }

  const { width, height } = getDimensions()

  useEffect(() => {
    const newData = generateData(dates)
    setData(newData)
  }, [])

  return (
    <Box display="flex" flexWrap="wrap">
      {data?.map((month) => (
        <div className="chart" key={month.name}>
          <p>{month.name}</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={'calendar'}
            style={{ backgroundColor: theme?.background }}
          >
            {renderMonth(month)}
          </svg>
        </div>
      ))}
    </Box>
  )
}

export default CalendarView
