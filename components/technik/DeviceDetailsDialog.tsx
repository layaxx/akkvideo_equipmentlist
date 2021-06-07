import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  createStyles,
  makeStyles,
  Theme,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
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

export default function DeviceDetailsDialog(props: {
  associatedDeviceNames?: string[]
  activeDevice: Device | null
  mode: any
  show: boolean
  updateState: Function
  options: any
  handleClose: any
}) {
  const handleCloseExtended = () => {
    setHasBeenEdited(false)
    handleClose()
  }
  const { activeDevice, mode, show, updateState, options, handleClose } = props
  const readOnly = mode === DialogMode.ReadOnly
  const isCreateNew = mode === DialogMode.Create
  const [hasBeenEdited, setHasBeenEdited] = useState(false)
  const displayAddButton =
    isCreateNew &&
    !!activeDevice &&
    !!activeDevice.description &&
    !!activeDevice.location &&
    !!activeDevice.amount
  const restProps = {
    updateState: (x: any) => {
      updateState(x)
      setHasBeenEdited(true)
    },
    activeDevice,
  }

  const classes = useStyles()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const handleChange = (
    event:
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    setHasBeenEdited(true)
    updateState({
      dialogDetailsActiveDevice: {
        ...activeDevice,
        ...{ [event.target.id]: event.target.value },
      },
    })
  }

  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasBeenEdited(true)
    updateState({
      dialogDetailsActiveDevice: {
        ...activeDevice,
        ...{ amount: Math.max(parseInt(event.target.value), 1) },
      },
    })
  }

  const handleEdit = () => {
    axios
      .post('/api/devices/edit', activeDevice)
      .then(() =>
        enqueueSnackbar(
          'Successfully edited Device ' +
            activeDevice?.description +
            '. Reload page to see changes in effect.',
          {
            variant: 'success',
          }
        )
      )
      .catch(() =>
        enqueueSnackbar('Failed to edit device ' + activeDevice?.description, {
          variant: 'error',
        })
      )
  }

  const handleAdd = () => {
    axios
      .post('/api/devices/add', activeDevice)
      .then(() =>
        enqueueSnackbar(
          'Successfully added Device ' +
            activeDevice?.description +
            ' reload page to see changes in effect.',
          {
            variant: 'success',
          }
        )
      )
      .catch(() =>
        enqueueSnackbar('Failed to add device ' + activeDevice?.description, {
          variant: 'error',
        })
      )
  }

  return (
    <Dialog
      disableBackdropClick={isCreateNew}
      disableEscapeKeyDown={isCreateNew}
      fullWidth={true}
      maxWidth={'md'}
      open={show}
      onClose={handleCloseExtended}
      aria-labelledby="details-dialog-title"
    >
      {isCreateNew ? (
        <DialogTitle id="details-dialog-title">
          Add a new device{' '}
          <small style={{ marginLeft: '2rem' }}>
            [Only available for Admins]
          </small>
        </DialogTitle>
      ) : (
        <DialogTitle id="details-dialog-title">
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
                {...restProps}
              />
            </Grid>
            <Grid item xs={12} md={4} sm={6}>
              <TextField
                id="description"
                label="Name"
                required
                defaultValue={activeDevice?.description}
                onBlur={handleChange}
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
                {...restProps}
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
                {...restProps}
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
                {...restProps}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="comments"
                label="Comments"
                defaultValue={activeDevice?.comments}
                onBlur={handleChange}
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
                {...restProps}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="store"
                label="Store"
                defaultValue={activeDevice?.store}
                onBlur={handleChange}
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
                defaultValue={activeDevice?.price}
                onBlur={handleChange}
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="associated"
                label="Associated Devices"
                type="number"
                defaultValue={activeDevice?.associated}
                onBlur={handleChange}
                InputProps={{
                  disabled: readOnly,
                }}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item>
              <List dense>
                {props.associatedDeviceNames?.map((name, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={name} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions>
        {!readOnly && !isCreateNew
          ? hasBeenEdited && (
              <Button onClick={handleEdit} color="primary">
                Submit Change
              </Button>
            )
          : displayAddButton && (
              <Button onClick={handleAdd} color="primary">
                Add Device
              </Button>
            )}
        <Button onClick={handleCloseExtended} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
