import React from 'react'
import nookies from 'nookies'
import { firebaseAdmin } from '../../firebaseAdmin'
import { GetServerSidePropsContext } from 'next'
import Device, { EmptyDevice } from '../../lib/types/Device'
import roles from '../../lib/auth/roles'
import { DataGrid, GridCellParams, GridRowId } from '@material-ui/data-grid'
import { Button, Grid } from '@material-ui/core'
import CustomNoRowsOverlay from '../../components/technik/customNoRowsOverlay'
import CustomToolbar from '../../components/technik/customToolbar'
import DeviceDetailsDialog from '../../components/technik/DeviceDetailsDialog'
import { Add } from '@material-ui/icons'
import ListAltIcon from '@material-ui/icons/ListAlt'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeviceLendingDialog from '../../components/technik/DeviceLendingDialog'
import Head from 'next/head'
const pdf = require('pdfjs')
const helvetica = require('pdfjs/font/Helvetica')
const helveticaBold = require('pdfjs/font/Helvetica-Bold')

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx)
    var hasAccess,
      isAdmin = false
    await firebaseAdmin
      .auth()
      .verifyIdToken(cookies.token)
      .then(({ role }) => {
        if (
          role === roles.Admin ||
          role === roles.Moderator ||
          role === roles.Member
        ) {
          hasAccess = true
          isAdmin = role === roles.Admin
        }
      })

    if (!hasAccess) {
      return {
        redirect: {
          permanent: false,
          destination: '/?msg=InsufficientAuthentication',
        },
      }
    }

    const entries = await firebaseAdmin.firestore().collection('devices').get()
    const devices = entries.docs
      .map(
        (entry) =>
          ({
            ...entry.data(),
            id: entry.id,
          } as Device)
      )
      .sort((first: Device, second: Device) =>
        first.description
          .toLowerCase()
          .localeCompare(second.description.toLowerCase())
      )

    return {
      props: { devices, revalidate: 10, isAdmin },
    }
  } catch (err) {
    console.log(err)
    return {
      redirect: {
        permanent: false,
        destination: '/login?redirect=technik',
      },
    }
  }
}

export enum DialogMode {
  Create,
  Edit,
  ReadOnly,
}

interface DeviceState {
  dialogDetailsShow: boolean
  dialogDetailsActiveDevice: Device | null
  dialogDetailsMode: DialogMode
  dialogLendingShow: boolean
  selectionModel: GridRowId[]
  showMenu: boolean
  pdfb64: string
}

class TechnikOverview extends React.Component<
  { devices: Device[]; isAdmin: boolean },
  DeviceState
> {
  data: any
  isAdmin: boolean
  options: {
    location: string[]
    location_prec: string[]
    container: string[]
    brand: string[]
    category: string[]
  }

  constructor(props: any) {
    super(props)
    this.isAdmin = props.isAdmin
    this.state = {
      dialogLendingShow: false,
      dialogDetailsShow: false,
      dialogDetailsMode: this.isAdmin ? DialogMode.Edit : DialogMode.ReadOnly,
      dialogDetailsActiveDevice: null,
      selectionModel: [],
      showMenu: false,
      pdfb64: '',
    }
    const renderButton = (params: GridCellParams) => (
      <Button
        variant="text"
        color="default"
        size="medium"
        fullWidth
        style={{ justifyContent: 'left' }}
        aria-label="open details"
        onClick={() =>
          this.setState({
            dialogDetailsShow: true,
            dialogDetailsActiveDevice: params.row as Device,
            dialogDetailsMode: this.isAdmin
              ? DialogMode.Edit
              : DialogMode.ReadOnly,
          })
        }
      >
        {params.value}
      </Button>
    )
    this.toggleMenu = this.toggleMenu.bind(this)
    this.createPDF = this.createPDF.bind(this)
    this.data = {
      columns: [
        { field: 'amount', headerName: 'Amount', width: 50, type: 'number' },
        { field: 'brand', headerName: 'Brand', width: 150 },
        {
          field: 'description',
          headerName: 'Name',
          width: 200,
          disableClickEventBubbling: true,
          renderCell: renderButton,
        },
        { field: 'location', headerName: 'Location', width: 150 },
        {
          field: 'category',
          headerName: 'Category',
          width: 150,
          valueFormatter: ({ value }: { value: string }) =>
            value.split('+++').join(','),
        },
        { field: 'status', headerName: 'Status', width: 100 },
        {
          field: 'price',
          headerName: 'Price',
          type: 'number',
          width: 90,
        },
        { field: 'id', headerName: 'ID', hide: true },
        {
          field: 'location_prec',
          headerName: 'Location precise',
          width: 150,
          hide: true,
        },
        {
          field: 'container',
          headerName: 'Container',
          width: 150,
          hide: true,
        },
        {
          field: 'store',
          headerName: 'Store',
          width: 150,
          hide: true,
        },
        {
          field: 'buyDate',
          headerName: 'Date of Purchase',
          type: 'date',
          width: 150,
          hide: true,
        },
      ],
      rows: props.devices,
    }
    this.options = {
      location: [
        ...new Set(
          this.props.devices
            .map((device: Device) => device.location)
            .filter((value: string) => value !== '')
        ),
      ],
      location_prec: [
        ...new Set(
          this.props.devices
            .map((device: Device) => device.location_prec)
            .filter((value: string) => value !== '')
        ),
      ],
      container: [
        ...new Set(
          this.props.devices
            .map((device: Device) => device.container)
            .filter((value: string) => value !== '')
        ),
      ],
      brand: [
        ...new Set(
          this.props.devices
            .map((device: Device) => device.brand)
            .filter((value: string) => value !== '')
        ),
      ],
      category: [
        ...new Set(
          this.props.devices
            .map((device: Device) => device.category)
            .map((val) => val.split('+++'))
            .flat()
            .filter((value: string) => value !== '')
        ),
      ],
    }
  }

  toggleMenu() {
    this.setState((prevState) => ({ showMenu: !prevState.showMenu }))
  }

  createPDF() {
    try {
      var doc = new pdf.Document({
        font: helvetica,
        padding: 40,
        lineHeight: 1.3,
        properties: { title: 'AK Video Geräteliste' },
      })
      fetch('/logo.jpg').then((x) => {
        x.arrayBuffer()
          .then((m) => new pdf.Image(m))
          .then((logo) => {
            var header = doc
              .header()
              .table({ widths: [null, null], paddingBottom: 1 * pdf.cm })
              .row()
            header.cell().image(logo, { height: 2 * pdf.cm })
            header
              .cell()
              .text({ textAlign: 'right', fontSize: 25, font: helveticaBold })
              .add('Geräteliste')
              .text({ textAlign: 'right', fontSize: 12, font: helvetica })
              .add(`Stand: ${new Date().toLocaleDateString()}`)

            doc.footer().pageNumber(
              function (curr: number, total: number) {
                return `Seite ${curr} von ${total}`
              },
              { textAlign: 'right' }
            )

            doc.cell()

            var table = doc.table({
              widths: [
                1.5 * pdf.cm,
                null,
                3 * pdf.cm,
                2 * pdf.cm,
                2.5 * pdf.cm,
              ],
              borderHorizontalWidths: function (i: number) {
                return i == 0 ? 0 : i < 2 ? 2 : 0.01
              },
              padding: 5,
            })

            var tr = table.header({
              font: helveticaBold,
              borderBottomWidth: 1.5,
            })
            tr.cell('#')
            tr.cell().text('Name').add('(Marke)', { font: helvetica })
            tr.cell('Lagerort', { textAlign: 'right' })
            tr.cell('Preis', { textAlign: 'right' })
            tr.cell('Kaufjahr', { textAlign: 'right' })

            function addRow(device: Device) {
              var tr = table.row()
              tr.cell(device.amount.toString())
              var article = tr.cell().text()
              article
                .add(device.description, { font: helveticaBold })
                .add(device.brand ? `(${device.brand})` : '', {
                  fontSize: 11,
                  textAlign: 'justify',
                })
              tr.cell(device.location, { textAlign: 'right' })
              tr.cell(device.price ? device.price + ' €' : '', {
                textAlign: 'right',
              })
              tr.cell(device.buyDate.substring(device.buyDate.length - 4), {
                textAlign: 'right',
              })
            }

            if (this.data.rows) {
              this.data.rows.forEach((device: Device) => addRow(device))
            } else {
              console.error('Cannot create a report for 0 devices')
            }
            doc.asBuffer().then((buf: any) => {
              this.setState({
                pdfb64: `data:application/pdf;base64,${buf.toString('base64')}`,
              })
            })
          })
      })
    } catch (error) {
      console.error('Failed to create a report: ' + error)
    }
  }

  render() {
    return (
      <>
        <Head>
          <title>Technik | AK Video intern</title>
        </Head>
        <div style={{ margin: 'auto', maxWidth: '40rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Technikverwaltung
          </h1>
          <div>
            <h2>Registered devices</h2>
            <div style={{ display: 'flex', placeContent: 'space-between' }}>
              <em>Click on name for details</em>
              <em onClick={this.toggleMenu} style={{ cursor: 'pointer' }}>
                {this.state.showMenu ? 'hide menu' : 'show menu'}
              </em>
            </div>
            <div style={{ height: 600, width: '100%' }}>
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                  <DataGrid
                    checkboxSelection
                    onSelectionModelChange={(newSelection) => {
                      this.setState({
                        selectionModel: newSelection.selectionModel,
                      })
                    }}
                    selectionModel={this.state.selectionModel}
                    components={{
                      Toolbar: this.state.showMenu ? CustomToolbar : undefined,
                      NoRowsOverlay: CustomNoRowsOverlay,
                    }}
                    {...this.data}
                    pageSize={50}
                  />
                </div>
              </div>
            </div>
            <Grid
              container
              justify="space-evenly"
              alignItems="center"
              style={{ whiteSpace: 'break-spaces', marginTop: '1rem' }}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => this.setState({ dialogLendingShow: true })}
                >
                  Start lending process for selected Devices
                </Button>
              </Grid>
            </Grid>
            {this.isAdmin && (
              <Grid
                container
                justify="space-evenly"
                alignItems="center"
                style={{ whiteSpace: 'break-spaces' }}
              >
                <Grid item>
                  <Button
                    style={{ marginTop: '1rem' }}
                    variant="outlined"
                    onClick={() =>
                      this.setState((state) => {
                        return {
                          dialogDetailsActiveDevice:
                            state.dialogDetailsMode === DialogMode.Create
                              ? state.dialogDetailsActiveDevice
                              : EmptyDevice,
                          dialogDetailsShow: true,
                          dialogDetailsMode: DialogMode.Create,
                        }
                      })
                    }
                  >
                    <Add /> new Device
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={this.createPDF}
                    style={{ marginTop: '1rem' }}
                  >
                    <ListAltIcon /> generate Report
                  </Button>
                </Grid>
                {!!this.state.pdfb64 && (
                  <Grid item>
                    <Button
                      style={{ marginTop: '1rem' }}
                      variant="outlined"
                      href={this.state.pdfb64}
                      download="akvideo-geraeteliste.pdf"
                    >
                      <GetAppIcon /> download Report
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
          </div>

          <iframe
            width="100%"
            height="1000rem"
            hidden={!this.state.pdfb64}
            src={this.state.pdfb64}
            style={{ marginTop: '2rem' }}
          />
          <DeviceLendingDialog
            handleClose={() => this.setState({ dialogLendingShow: false })}
            devices={this.data.rows.filter((device: Device) =>
              this.state.selectionModel.includes(device.id)
            )}
            show={this.state.dialogLendingShow}
          />
          <DeviceDetailsDialog
            handleClose={() => this.setState({ dialogDetailsShow: false })}
            activeDevice={this.state.dialogDetailsActiveDevice}
            mode={this.state.dialogDetailsMode}
            show={this.state.dialogDetailsShow}
            updateState={(newState: { dialogDetailsActiveDevice: Device }) =>
              this.setState(newState)
            }
            options={this.options}
          />
        </div>
      </>
    )
  }
}

export default TechnikOverview
