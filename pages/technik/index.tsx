import React from 'react'
import nookies from 'nookies'
import { firebaseAdmin } from '../../firebaseAdmin'
import { GetServerSidePropsContext } from 'next'
import Device, { EmptyDevice } from '../../lib/types/Device'
import roles from '../../lib/auth/roles'
import { DataGrid } from '@material-ui/data-grid'
import { Button, Grid } from '@material-ui/core'
import CustomNoRowsOverlay from '../../components/technik/customNoRowsOverlay'
import CustomToolbar from '../../components/technik/customToolbar'
import DeviceDetailsDialog from '../../components/technik/dialogs/Details/DeviceDetailsDialog'
import { Add } from '@material-ui/icons'
import ListAltIcon from '@material-ui/icons/ListAlt'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeviceLendingDialog from '../../components/technik/dialogs/DeviceLendingDialog'
import Head from 'next/head'
import DeviceBulkEditDialog from '../../components/technik/dialogs/bulkEdit/DeviceBulkEditDialog'
import { DeviceState } from '../../lib/types/device.state'
import createPDF from '../../lib/technik/pdfgen'
import genData from '../../lib/technik/genData'
import genOptions from '../../lib/technik/genOptions'
import { IOptionsLookup } from '../../lib/types/device.dialog'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx)
    let hasAccess,
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
          destination: '/?msg=Technik%3A%20Insufficient%20Access%20Rights',
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

class TechnikOverview extends React.Component<
  { devices: Device[]; isAdmin: boolean },
  DeviceState
> {
  data: any
  isAdmin: boolean
  options: IOptionsLookup

  constructor(props: any) {
    super(props)
    this.isAdmin = props.isAdmin
    this.state = {
      dialogLendingShow: false,
      dialogDetailsShow: false,
      dialogBulkEditShow: false,
      dialogDetailsMode: this.isAdmin ? DialogMode.Edit : DialogMode.ReadOnly,
      dialogDetailsActiveDevice: null,
      selectionModel: [],
      showMenu: false,
      pdfb64: '',
    }

    this.toggleMenu = this.toggleMenu.bind(this)
    this.data = genData(
      props.devices,
      (newState) => this.setState(newState),
      this.isAdmin
    )
    this.options = genOptions(props.devices)
  }

  toggleMenu() {
    this.setState(({ showMenu }) => ({ showMenu: !showMenu }))
  }

  render() {
    return (
      <>
        <Head>
          <title>Technik | AK Video intern</title>
        </Head>
        <div style={{ margin: 'auto', maxWidth: '70rem' }}>
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
                    onSelectionModelChange={({ selectionModel }) => {
                      this.setState({
                        selectionModel,
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
              {this.isAdmin && (
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() => this.setState({ dialogBulkEditShow: true })}
                  >
                    Bulk edit selected devices
                  </Button>
                </Grid>
              )}
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
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      createPDF(this.data, (newState: { pdfb64: string }) =>
                        this.setState(newState)
                      )
                    }
                    style={{ marginTop: '1rem' }}
                  >
                    <ListAltIcon /> generate Report
                  </Button>
                </Grid>
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
          <DeviceBulkEditDialog
            handleClose={() => this.setState({ dialogBulkEditShow: false })}
            devices={this.data.rows.filter((device: Device) =>
              this.state.selectionModel.includes(device.id)
            )}
            show={this.state.dialogBulkEditShow}
            options={this.options}
          />

          <DeviceLendingDialog
            handleClose={() => this.setState({ dialogLendingShow: false })}
            devices={this.data.rows.filter((device: Device) =>
              this.state.selectionModel.includes(device.id)
            )}
            show={this.state.dialogLendingShow}
          />
          <DeviceDetailsDialog
            devices={this.data.rows}
            handleClose={() => this.setState({ dialogDetailsShow: false })}
            activeDevice={this.state.dialogDetailsActiveDevice}
            mode={this.state.dialogDetailsMode}
            show={this.state.dialogDetailsShow}
            options={this.options}
          />
        </div>
      </>
    )
  }
}

export default TechnikOverview
