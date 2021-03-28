import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  createStyles,
  makeStyles,
  Theme,
  Grid,
} from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment'
import axios from 'axios'
import { useRouter } from 'next/dist/client/router'
import { useSnackbar } from 'notistack'
import React from 'react'
import { Button } from 'reactstrap'
import Device from '../../lib/types/Device'
import { DialogMode } from '../../pages/technik/index'
import MultiSelect from './MultiSelect'
import SingleSelect from './SingleSelect'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        minWidth: '25ch',
      },

      '& .Mui-disabled': {
        color: 'black',
      },
    },
    noEdit: {
      '& .Mui-disabled': {
        color: 'gray',
      },
    },
  })
)

export default function DeviceDialog(props: {
  activeDevice: Device | null
  mode: any
  show: boolean
  updateState: Function
  options: any
  handleClose: any
}) {
  const classes = useStyles()
  const { activeDevice, mode, show, updateState, options, handleClose } = props
  const readOnly = mode === DialogMode.ReadOnly

  // used for navigation an query params
  const router = useRouter()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateState({
      dialogActiveDevice: {
        ...activeDevice,
        ...{ [event.target.id]: event.target.value },
      },
    })
  }

  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateState({
      dialogActiveDevice: {
        ...activeDevice,
        ...{ amount: Math.max(parseInt(event.target.value), 1) },
      },
    })
  }

  const handleEdit = () => {
    axios
      .post('/api/devices/edit', activeDevice)
      .then(() => router.reload())
      .catch(() =>
        enqueueSnackbar('Failed to edit device ' + activeDevice?.description, {
          variant: 'error',
        })
      )
  }

  const handleAdd = () => {
    axios
      .post('/api/devices/add', activeDevice)
      .then(() => router.reload())
      .catch(() =>
        enqueueSnackbar('Failed to add device ' + activeDevice?.description, {
          variant: 'error',
        })
      )
  }

  const createNew = mode === DialogMode.Create

  return (
    <Dialog
      disableBackdropClick={createNew}
      disableEscapeKeyDown={createNew}
      fullWidth={true}
      maxWidth={'md'}
      open={show}
      onClose={handleClose}
      aria-labelledby="dialog-title"
    >
      {createNew ? (
        <DialogTitle id="dialog-title">
          Add a new device{' '}
          <small style={{ marginLeft: '2rem' }}>
            [Only available for Admins]
          </small>
        </DialogTitle>
      ) : (
        <DialogTitle id="dialog-title">
          Details for {activeDevice?.description} ({activeDevice?.id}){' '}
          {readOnly && <small style={{ marginLeft: '2rem' }}>Readonly</small>}
        </DialogTitle>
      )}
      <DialogContent>
        <form className={classes.root} noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sm={6}>
              <SingleSelect
                readOnly={readOnly}
                options={options.brand.map((brand: string) => ({
                  inputValue: '',
                  title: brand,
                }))}
                label="brand"
                updateState={updateState}
                activeDevice={activeDevice}
              />
            </Grid>
            <Grid item xs={12} md={4} sm={6}>
              <TextField
                id="description"
                label="Name"
                required
                value={activeDevice?.description}
                onChange={handleChange}
                InputProps={{
                  disabled: readOnly,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4} sm={6}>
              <TextField
                id="id"
                label="ID (read-only)"
                value={activeDevice?.id}
                onChange={handleChange}
                className={classes.noEdit}
                InputProps={{
                  readOnly: true,
                  disabled: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4} sm={6}>
              <SingleSelect
                readOnly={readOnly}
                options={options.location.map((location: string) => ({
                  inputValue: '',
                  title: location,
                }))}
                label="location"
                updateState={updateState}
                activeDevice={activeDevice}
              />
            </Grid>
            <Grid item xs={12} md={4} sm={6}>
              <SingleSelect
                readOnly={readOnly}
                options={options.location_prec.map((location_prec: string) => ({
                  inputValue: '',
                  title: location_prec,
                }))}
                label="location_prec"
                updateState={updateState}
                activeDevice={activeDevice}
              />
            </Grid>
            <Grid item xs={12} md={4} sm={6}>
              <SingleSelect
                readOnly={readOnly}
                options={options.container.map((container: string) => ({
                  inputValue: '',
                  title: container,
                }))}
                label="container"
                updateState={updateState}
                activeDevice={activeDevice}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="comments"
                label="Comments"
                value={activeDevice?.comments}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputProps={{
                  disabled: readOnly,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MultiSelect
                readOnly={readOnly}
                options={options.category.map((category: string) => ({
                  inputValue: '',
                  title: category,
                }))}
                label="category"
                updateState={updateState}
                activeDevice={activeDevice}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="store"
                label="Store"
                value={activeDevice?.store}
                onChange={handleChange}
                InputProps={{
                  disabled: readOnly,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="price"
                label="Price"
                type="number"
                value={activeDevice?.price}
                onChange={handleChange}
                InputProps={{
                  disabled: readOnly,
                  startAdornment: (
                    <InputAdornment position="start">€</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="amount"
                label="Amount"
                type="number"
                value={activeDevice?.amount}
                onChange={handleChangeAmount}
                required
                disabled={readOnly}
                InputLabelProps={{
                  disabled: readOnly,
                  'aria-valuemin': 1,
                  'aria-valuemax': 9999,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="buyDate"
                label="Date of Purchase"
                type="date"
                value={activeDevice?.buyDate}
                onChange={handleChange}
                disabled={readOnly}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="lastEdit"
                label="Entry updated: (read-only)"
                value={activeDevice?.lastEdit}
                onChange={handleChange}
                className={classes.noEdit}
                InputProps={{
                  disabled: true,
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        {!readOnly && !createNew ? (
          <Button onClick={handleEdit} color="primary">
            Submit Change
          </Button>
        ) : (
          createNew &&
          !!activeDevice &&
          !!activeDevice.description &&
          !!activeDevice.location &&
          !!activeDevice.amount && (
            <Button onClick={handleAdd} color="primary">
              Add Device
            </Button>
          )
        )}
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
