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
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Device from '../../../../lib/types/Device'
import { IDetailsDialogProps } from '../../../../lib/types/device.dialog.types'
import { DialogMode } from '../../../../pages/technik/index'
import CustomSelect from './CustomSelect'

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

export default function DeviceDetailsDialog(props: IDetailsDialogProps) {
  const { devices, activeDevice, mode, show, options, handleClose } = props
  const handleCloseExtended = handleClose
  const readOnly = mode === DialogMode.ReadOnly
  const isCreateNew = mode === DialogMode.Create
  const displayAddButton = isCreateNew

  var { handleSubmit, control, reset, watch, formState } = useForm({
    defaultValues: activeDevice || undefined,
    mode: 'onChange',
  })

  const associatedID = watch('associated')

  useEffect(() => {
    console.log('resetting')
    reset(activeDevice || undefined)
  }, [activeDevice])

  const classes = useStyles()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const handleEdit = async (data: Device) => {
    axios
      .post('/api/devices/edit', data)
      .then(() =>
        enqueueSnackbar(
          'Successfully edited Device ' +
            data.description +
            '. Reload page to see changes in effect.',
          {
            variant: 'success',
          }
        )
      )
      .catch(() =>
        enqueueSnackbar('Failed to edit device ' + data.description, {
          variant: 'error',
        })
      )
  }

  const handleAdd = async (data: Device) => {
    axios
      .post('/api/devices/add', data)
      .then(() =>
        enqueueSnackbar(
          'Successfully added Device ' +
            data.description +
            ' reload page to see changes in effect.',
          {
            variant: 'success',
          }
        )
      )
      .catch(() =>
        enqueueSnackbar('Failed to add device ' + data.description, {
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
        <form className={classes.root} autoComplete="off">
          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                readOnly={readOnly}
                value={value}
                onChange={onChange}
                options={options}
                attr="brand"
              />
            )}
          />

          <Controller
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
                  disabled: readOnly,
                }}
              />
            )}
          />

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

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                readOnly={readOnly}
                value={value}
                onChange={onChange}
                options={options}
                attr="location"
              />
            )}
          />

          <Controller
            control={control}
            name="location_prec"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                readOnly={readOnly}
                value={value}
                onChange={onChange}
                options={options}
                attr="location_prec"
              />
            )}
          />

          <Controller
            control={control}
            name="container"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                readOnly={readOnly}
                value={value}
                onChange={onChange}
                options={options}
                attr="container"
              />
            )}
          />

          <Controller
            control={control}
            name="comments"
            render={({ field: { onChange, value } }) => (
              <TextField
                id="comments"
                label="comments"
                value={value}
                onChange={onChange}
                fullWidth
                InputProps={{
                  disabled: readOnly,
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                readOnly={readOnly}
                value={value}
                onChange={onChange}
                options={options}
                attr="category"
              />
            )}
          />

          <Controller
            control={control}
            name="store"
            render={({ field: { onChange, value } }) => (
              <TextField
                id="store"
                label="Store"
                value={value}
                onChange={onChange}
                InputProps={{
                  disabled: readOnly,
                }}
              />
            )}
          />

          <Controller
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
                  disabled: readOnly,
                  startAdornment: (
                    <InputAdornment position="start">€</InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
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
                  disabled: readOnly,
                  'aria-valuemin': 1,
                  'aria-valuemax': 9999,
                }}
              />
            )}
          />

          <Controller
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
                  disabled: readOnly,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />

          <Controller
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

          <Controller
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
                  disabled: readOnly,
                }}
              />
            )}
          />

          {associatedID === -1 ? undefined : (
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
          )}
        </form>
        {/* <form className={classes.root} noValidate autoComplete="off">
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
                onChange={handleChange}
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
        </form> */}
      </DialogContent>

      <DialogActions>
        {!readOnly && !isCreateNew ? (
          <Button
            onClick={handleSubmit(
              async (data) => handleEdit(data),
              console.error
            )}
            color="primary"
            disabled={!formState.isDirty || formState.isSubmitting}
          >
            Submit Change
          </Button>
        ) : (
          displayAddButton && (
            <Button
              onClick={handleSubmit(
                async (data) => handleAdd(data),
                console.error
              )}
              color="primary"
              disabled={
                !formState.isDirty ||
                !formState.isValid ||
                formState.isSubmitting
              }
            >
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
