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
  Typography,
  Paper,
  Container,
} from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Device from '../../../../lib/types/Device'
import { IDetailsDialogProps } from '../../../../lib/types/device.dialog.types'
import { DialogMode } from '../../../../pages/technik/index'
import CustomSelect from './CustomSelect'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    indicator: {
      marginLeft: '2rem',
    },
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        minWidth: '25ch',
      },

      '& .Mui-disabled': {
        color: 'black',
      },
      '& #list': {
        flexGrow: 1,
      },
    },
    noEdit: {
      '& .Mui-disabled': {
        color: 'gray',
      },
    },
  })
)

export default function DeviceDetailsDialog(props: IDetailsDialogProps) {
  const { devices, activeDevice, mode, show, options, handleClose } = props
  const handleCloseExtended = handleClose
  const isReadOnly = mode === DialogMode.ReadOnly
  const isCreateNew = mode === DialogMode.Create
  const displayAddButton = isCreateNew

  var { handleSubmit, control, reset, watch, formState } = useForm({
    defaultValues: activeDevice || undefined,
    mode: 'onChange',
  })

  const buttonAdd = (
    <Button
      onClick={handleSubmit(
        async (data) => handlePost(data, actionEnum.add),
        console.error
      )}
      color="primary"
      disabled={
        !formState.isDirty || !formState.isValid || formState.isSubmitting
      }
    >
      Add Device
    </Button>
  )

  const buttonSubmit = (
    <Button
      onClick={handleSubmit(
        async (data) => handlePost(data, actionEnum.edit),
        console.error
      )}
      color="primary"
      disabled={
        !formState.isDirty || !formState.isValid || formState.isSubmitting
      }
    >
      Submit Change
    </Button>
  )

  const associatedID = watch('associated')

  useEffect(() => {
    reset(activeDevice || undefined)
  }, [activeDevice])

  const classes = useStyles()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  enum actionEnum {
    add = 'add',
    edit = 'edit',
  }

  const handlePost = (data: Device, action: actionEnum) => {
    axios
      .post('/api/devices/' + action, data)
      .then(() =>
        enqueueSnackbar(
          `Successfully ${action}ed Device ${data.description}. 
          Reload page to see changes in effect.`,
          {
            variant: 'success',
          }
        )
      )
      .catch(() =>
        enqueueSnackbar(`Failed to ${action} device ${data.description}`, {
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
      <DialogTitle id="details-dialog-title">
        {isCreateNew
          ? 'Add a new device'
          : `Details for ${activeDevice?.description} (${activeDevice?.id})`}

        {(isReadOnly || isCreateNew) && (
          <Typography
            variant="caption"
            component="small"
            className={classes.indicator}
          >
            {isCreateNew ? '[Only available for Admins]' : '[Read-Only]'}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Container>
          <form className={classes.root} autoComplete="off">
            <Typography variant="h4" component="h2">
              General Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item>
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
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="lastEdit"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="lastEdit"
                      label="Last edit:"
                      type="datetime"
                      value={value}
                      onChange={onChange}
                      className={classes.noEdit}
                      InputProps={{
                        disabled: true,
                        readOnly: true,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item>
                <Controller
                  rules={{ required: true }}
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="description"
                      label="Name"
                      required
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="brand"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelect
                      readOnly={isReadOnly}
                      value={value}
                      onChange={onChange}
                      options={options}
                      attr="brand"
                    />
                  )}
                />
              </Grid>

              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelect
                      readOnly={isReadOnly}
                      value={value}
                      onChange={onChange}
                      options={options}
                      attr="category"
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="comments"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      multiline
                      id="comments"
                      label="comments"
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Controller
                  rules={{ required: true }}
                  control={control}
                  name="amount"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="amount"
                      label="amount"
                      required
                      type="number"
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                        'aria-valuemin': 1,
                        'aria-valuemax': 9999,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="store"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="store"
                      label="Store"
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="price"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="price"
                      label="price"
                      /*  required */
                      type="number"
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                        startAdornment: (
                          <InputAdornment position="start">€</InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="buyDate"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="buyDate"
                      label="Date of Purchase"
                      type="date"
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h4" component="h2">
              Location
            </Typography>

            <Grid container spacing={3}>
              <Grid item>
                <Controller
                  rules={{ required: true }}
                  control={control}
                  name="location"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelect
                      required
                      readOnly={isReadOnly}
                      value={value}
                      onChange={onChange}
                      options={options}
                      attr="location"
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="location_prec"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelect
                      readOnly={isReadOnly}
                      value={value}
                      onChange={onChange}
                      options={options}
                      attr="location_prec"
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="container"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelect
                      readOnly={isReadOnly}
                      value={value}
                      onChange={onChange}
                      options={options}
                      attr="container"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h4" component="h2">
              Associated Devices
            </Typography>

            <Grid container spacing={3}>
              <Grid item>
                <Controller
                  rules={{ required: false }}
                  control={control}
                  name="associated"
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      id="associated"
                      label="Associated Devices:"
                      type="number"
                      value={value}
                      onChange={onChange}
                      InputProps={{
                        disabled: isReadOnly,
                      }}
                    />
                  )}
                />
              </Grid>

              {associatedID !== -1 && associatedID && (
                <Grid item id="list">
                  <Paper>
                    <List dense>
                      {devices
                        .filter(
                          (device: Device) =>
                            (associatedID ?? 1) === (device.associated ?? 2) &&
                            device !== activeDevice
                        )
                        .map((device: Device, index: number) => (
                          <ListItem key={index}>
                            <ListItemText primary={device.description} />
                          </ListItem>
                        ))}
                    </List>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </form>
        </Container>
      </DialogContent>

      <DialogActions>
        {!isReadOnly && !isCreateNew
          ? buttonSubmit
          : displayAddButton && buttonAdd}

        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
