import React from 'react'
import nookies from 'nookies'
import { firebaseAdmin } from '../../firebaseAdmin'
import { GetServerSidePropsContext } from 'next'
import Device, { EmptyDevice } from '../../lib/types/Device'
import roles from '../../lib/auth/roles'
import {
  DataGrid,
  GridCellParams,
  GridRowId,
  GridRowModel,
} from '@material-ui/data-grid'
import { Button } from '@material-ui/core'
import CustomNoRowsOverlay from '../../components/technik/customNoRowsOverlay'
import CustomToolbar from '../../components/technik/customToolbar'
import DeviceDialog from '../../components/technik/device.dialog'
import { Add } from '@material-ui/icons'

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
  dialogShow: boolean
  dialogActiveDevice: GridRowModel | null
  dialogMode: DialogMode
  selectionModel: GridRowId[]
  showMenu: boolean
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
      dialogShow: false,
      dialogMode: this.isAdmin ? DialogMode.Edit : DialogMode.ReadOnly,
      dialogActiveDevice: null,
      selectionModel: [],
      showMenu: false,
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
            dialogShow: true,
            dialogActiveDevice: params.row,
            dialogMode: this.isAdmin ? DialogMode.Edit : DialogMode.ReadOnly,
          })
        }
      >
        {params.value}
      </Button>
    )
    this.toggleMenu = this.toggleMenu.bind(this)
    this.data = {
      columns: [
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

  render() {
    return (
      <div style={{ margin: 'auto', paddingTop: '4rem', maxWidth: '40rem' }}>
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
          <div style={{ height: 400, width: '100%' }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <DataGrid
                  checkboxSelection
                  onSelectionModelChange={(newSelection) => {
                    this.setState({
                      selectionModel: newSelection.selectionModel,
                    })
                    console.log(newSelection)
                  }}
                  selectionModel={this.state.selectionModel}
                  components={{
                    Toolbar: this.state.showMenu ? CustomToolbar : undefined,
                    NoRowsOverlay: CustomNoRowsOverlay,
                  }}
                  {...this.data}
                  pagesize={25}
                />
              </div>
            </div>
          </div>
          {this.isAdmin ? (
            <Button
              variant="outlined"
              style={{ marginTop: '1rem' }}
              onClick={() =>
                this.setState((state) => {
                  return {
                    dialogActiveDevice:
                      state.dialogMode === DialogMode.Create
                        ? state.dialogActiveDevice
                        : EmptyDevice,
                    dialogShow: true,
                    dialogMode: DialogMode.Create,
                  }
                })
              }
            >
              <Add /> new Device
            </Button>
          ) : null}
        </div>
        {/* <div>
        // Will be implemented at a later point in time
          <h2>Lend devices</h2>
          <em>Add devices to cart to start the process</em>
        </div> */}
        <DeviceDialog
          handleClose={() => this.setState({ dialogShow: false })}
          activeDevice={this.state.dialogActiveDevice}
          mode={this.state.dialogMode}
          show={this.state.dialogShow}
          updateState={(newState: { dialogActiveDevice: GridRowModel }) =>
            this.setState(newState)
          }
          options={this.options}
        />
      </div>
    )
  }
}

export default TechnikOverview
