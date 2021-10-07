import Device from '../types/Device'
import dayjs from 'dayjs'
import * as pdf from 'pdfjs'
import * as helvetica from 'pdfjs/font/Helvetica'
import * as helveticaBold from 'pdfjs/font/Helvetica-Bold'
import { Data } from './genData'

export default function createPDF(
  data: Data,
  setState: ({ pdfb64 }: { pdfb64: string }) => void
): void {
  try {
    const doc = new pdf.Document({
      font: helvetica,
      padding: 40,
      lineHeight: 1.3,
      properties: { title: 'AK Video Geräteliste' },
    })
    fetch('/logo.jpg').then((x) => {
      x.arrayBuffer()
        .then((m) => new pdf.Image(m))
        .then((logo) => {
          const header = doc
            .header()
            .table({ widths: [null, null], paddingBottom: 1 * pdf.cm })
            .row()
          header.cell().image(logo, { height: 2 * pdf.cm })
          const cell = header.cell()

          cell
            .text({ textAlign: 'right', fontSize: 25, font: helveticaBold })
            .add('Geräteliste')
          cell
            .text({ textAlign: 'right', fontSize: 12, font: helvetica })
            .add(`Stand: ${new Date().toLocaleDateString()}`)

          doc.footer().pageNumber(
            function (curr: number, total: number) {
              return `Seite ${curr} von ${total}`
            },
            { textAlign: 'right' }
          )

          doc.cell()

          const table = doc.table({
            widths: [1.5 * pdf.cm, null, 3 * pdf.cm, 2 * pdf.cm, 2.5 * pdf.cm],
            borderHorizontalWidths: function (i: number) {
              return i == 0 ? 0 : i < 2 ? 2 : 0.01
            },
            padding: 5,
          })

          const tr = table.header({
            font: helveticaBold,
            /* borderBottomWidth: 1.5, */
          })
          tr.cell('#')
          tr.cell().text('Name').add('(Marke)', { font: helvetica })
          tr.cell('Lagerort', { textAlign: 'right' })
          tr.cell('Preis', { textAlign: 'right' })
          tr.cell('Kaufjahr', { textAlign: 'right' })

          function addRow(device: Device) {
            const tr = table.row()
            tr.cell(device.amount.toString())
            const article = tr.cell().text()
            article
              .add(device.description, { font: helveticaBold })
              .add(device.brand ? `(${device.brand})` : '', {
                fontSize: 11,
                textAlign: 'justify',
              })
            tr.cell(device.location, { textAlign: 'right' })
            tr.cell(
              device.price
                ? (Math.round(device.price * 100) / 100).toFixed(2) + ' €'
                : '',
              {
                textAlign: 'right',
              }
            )
            tr.cell(
              device.buyDate ? dayjs(device.buyDate).format('MM-YYYY') : 'n/A',
              {
                textAlign: 'right',
              }
            )
          }

          if (data.rows) {
            data.rows.forEach((device: Device) => addRow(device))
          } else {
            console.error('Cannot create a report for 0 devices')
          }
          doc.asBuffer().then((buf: Buffer) => {
            setState({
              pdfb64: `data:application/pdf;base64,${buf.toString('base64')}`,
            })
          })
        })
    })
  } catch (error) {
    console.error('Failed to create a report: ' + error)
  }
}
