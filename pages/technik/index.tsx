import React, { useState } from 'react'
import { NextPage } from 'next'
import Device, { EmptyDevice } from '../../lib/types/Device'
import roles from '../../lib/auth/roles'
import { DataGrid, GridRowId } from '@material-ui/data-grid'
import { Button, Grid, Typography } from '@material-ui/core'
import CustomNoRowsOverlay from '../../components/technik/customNoRowsOverlay'
import CustomToolbar from '../../components/technik/customToolbar'
import DeviceDetailsDialog from '../../components/technik/dialogs/Details/DeviceDetailsDialog'
import { Add } from '@material-ui/icons'
import ListAltIcon from '@material-ui/icons/ListAlt'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeviceLendingDialog from '../../components/technik/dialogs/DeviceLendingDialog'
import Head from 'next/head'
import DeviceBulkEditDialog from '../../components/technik/dialogs/bulkEdit/DeviceBulkEditDialog'
import createPDF from '../../lib/technik/pdfgen'
import genData from '../../lib/technik/genData'
import genOptions from '../../lib/technik/genOptions'
import { db } from '../../lib/app'
import { useAuth } from '../../auth'
import useSWR from 'swr'
import { Alert } from '@material-ui/lab'

export enum DialogMode {
  Create,
  Edit,
  ReadOnly,
}

const TechnikOverview: NextPage = () => {
  const fetcher = async (): Promise<Device[]> => {
    const entries = await db.collection('devices').get()
    return entries.docs
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
  }

  const { user } = useAuth()

  const isAdmin = user?.role === roles.Admin
  const [dialogLendingShow, setDialogLendingShow] = useState(false)

  const [dialogDetailsShow, setDialogDetailsShow] = useState(false)
  const [dialogBulkEditShow, setDialogBulkEditShow] = useState(false)
  const [dialogDetailsMode, setDialogDetailsMode] = useState(
    isAdmin ? DialogMode.Edit : DialogMode.ReadOnly
  )

  const [dialogDetailsActiveDevice, setDialogDetailsActiveDevice] =
    useState<Device | null>(null)

  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([])

  const [showMenu, setShowMenu] = useState(false)

  const [pdfb64, setPdfb64] = useState('')

  const { data: devices, error } = useSWR('devices-all', fetcher)

  const setState = (state: {
    dialogDetailsShow: boolean
    dialogDetailsActiveDevice: Device | null
    dialogDetailsMode: DialogMode
  }) => {
    setDialogDetailsShow(state.dialogDetailsShow)
    setDialogDetailsActiveDevice(state.dialogDetailsActiveDevice)
    setDialogDetailsMode(state.dialogDetailsMode)
  }
  const data = genData(devices ?? [], (newState) => setState(newState), isAdmin)
  const options = genOptions(devices ?? [])

  const toggleMenu = (): void => {
    setShowMenu((bool) => !bool)
  }

  return (
    <>
      <Head>
        <title>Technik | AK Video intern</title>
      </Head>
      <div style={{ margin: 'auto', maxWidth: '70rem' }}>
        <Typography component="h1" variant="h3" gutterBottom>
          Arbeitskreis Video
        </Typography>
        <Typography component="h2" variant="h4" gutterBottom>
          Technikverwaltung
        </Typography>

        {error && (
          <Alert severity="error">
            Failed to fetch Devices. {!user && 'You are not logged in.'}
          </Alert>
        )}

        {!!user && user.role === roles.Public && (
          <Alert severity="error">
            You have insufficient Permissions to access this Page.
          </Alert>
        )}

        {!error &&
          user &&
          [roles.Member, roles.Moderator, roles.Admin].find(
            (role) => role == user?.role
          ) && (
            <div>
              <div style={{ display: 'flex', placeContent: 'space-between' }}>
                <em>Click on name for details</em>
                <Button onClick={toggleMenu}>
                  {showMenu ? 'hide menu' : 'show menu'}
                </Button>
              </div>
              <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                  loading={!error && !devices}
                  checkboxSelection
                  onSelectionModelChange={({ selectionModel }) => {
                    setSelectionModel(selectionModel)
                  }}
                  selectionModel={selectionModel}
                  components={{
                    Toolbar: showMenu ? CustomToolbar : undefined,
                    NoRowsOverlay: CustomNoRowsOverlay,
                  }}
                  {...data}
                  pageSize={50}
                />
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
                    onClick={() => setDialogLendingShow(true)}
                  >
                    Start lending process for selected Devices
                  </Button>
                </Grid>
                {isAdmin && (
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={() => setDialogBulkEditShow(true)}
                    >
                      Bulk edit selected devices
                    </Button>
                  </Grid>
                )}
              </Grid>
              {isAdmin && (
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
                      onClick={() => {
                        setDialogDetailsActiveDevice(
                          dialogDetailsMode === DialogMode.Create
                            ? dialogDetailsActiveDevice
                            : EmptyDevice
                        )
                        setDialogDetailsShow(true)
                        setDialogDetailsMode(DialogMode.Create)
                      }}
                    >
                      <Add /> new Device
                    </Button>
                  </Grid>
                  {!!pdfb64 && (
                    <Grid item>
                      <Button
                        style={{ marginTop: '1rem' }}
                        variant="outlined"
                        href={pdfb64}
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
                        createPDF(data, ({ pdfb64 }: { pdfb64: string }) =>
                          setPdfb64(pdfb64)
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
          )}

        <iframe
          width="100%"
          height="1000rem"
          hidden={!pdfb64}
          src={pdfb64}
          style={{ marginTop: '2rem' }}
        />
        <DeviceBulkEditDialog
          handleClose={() => setDialogBulkEditShow(false)}
          devices={data.rows.filter((device: Device) =>
            selectionModel.includes(device.id)
          )}
          show={dialogBulkEditShow}
          options={options}
        />

        <DeviceLendingDialog
          handleClose={() => setDialogLendingShow(false)}
          devices={data.rows.filter((device: Device) =>
            selectionModel.includes(device.id)
          )}
          show={dialogLendingShow}
        />
        <DeviceDetailsDialog
          devices={data?.rows}
          handleClose={() => setDialogDetailsShow(false)}
          activeDevice={dialogDetailsActiveDevice}
          mode={dialogDetailsMode}
          show={dialogDetailsShow}
          options={options}
        />
      </div>
    </>
  )
}

export default TechnikOverview
