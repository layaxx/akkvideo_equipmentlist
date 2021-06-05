import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Select,
  MenuItem,
  Grid,
} from '@material-ui/core'
import { Alert, Autocomplete, createFilterOptions } from '@material-ui/lab'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import Device from '../../lib/types/Device'
import { OptionsType } from './SingleSelect'

export default function DeviceBulkEditDialog(props: {
  devices: Device[]
  show: boolean
  handleClose: any
  options: any
}) {
  const { devices, show, handleClose } = props
  const handleSendRequest = () => {
    axios
      .post('/api/devices/bulkEdit', {
        ids: devices.map((d) => d.id).join('+++'),
        cat: activeCat.name,
        value,
      })
      .then(() => {
        enqueueSnackbar(
          'Successfully updated Devices. Reload page to view Results.',
          {
            variant: 'success',
          }
        )
        handleClose()
      })
      .catch(() =>
        enqueueSnackbar('Failed to update Devices.', {
          variant: 'error',
        })
      )
  }

  const [value, setValue] = useState('')
  const [activeCat, setActiveCat] = useState({
    name: 'location',
    options: props.options.location,
  })

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  return (
    <Dialog
      disableBackdropClick={devices.length > 0}
      disableEscapeKeyDown={devices.length > 0}
      fullWidth={true}
      maxWidth={'md'}
      open={show}
      onClose={handleClose}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">Request Lending Devices</DialogTitle>

      <DialogContent>
        {devices.length === 0 && (
          <Alert severity="error" style={{ marginBottom: '1rem' }}>
            You first need to add Devices by selecting them.
          </Alert>
        )}
        <Grid
          container
          direction="row"
          justify="space-around"
          alignItems="flex-start"
        >
          <Grid item>
            <Typography component="h3" variant="h6">
              Devices:
            </Typography>
            <ul>
              {devices.map((device) => (
                <li key={device.id}>{device.description}</li>
              ))}
            </ul>
          </Grid>
          <Grid item>
            <Typography component="h3" variant="h6">
              Edit:
            </Typography>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              defaultValue={'location'}
              onChange={(event) => {
                console.log(props.options)
                setActiveCat({
                  name: event.target.value as string,
                  options: props.options[event.target.value as string] ?? [],
                })
              }}
            >
              <MenuItem value={'location'}>Location</MenuItem>
              <MenuItem value={'location_prec'}>Location Precise</MenuItem>
              <MenuItem value={'container'}>Container</MenuItem>
            </Select>
            <Autocomplete
              /* value={activeDevice?.[label]} */
              onChange={(_, newValue) => {
                if (typeof newValue === 'string') {
                  setValue(newValue)
                } else if (newValue && newValue.inputValue) {
                  // Create a new value from the user input
                  setValue(newValue.inputValue)
                } else {
                  setValue(newValue?.title || '')
                }
              }}
              filterOptions={(optionsParam: any, params: any) => {
                const filtered = createFilterOptions<OptionsType>()(
                  optionsParam,
                  params
                )

                // Suggest the creation of a new value
                if (params.inputValue !== '') {
                  filtered.push({
                    inputValue: params.inputValue,
                    title: `Add ${activeCat.name} "${params.inputValue}"`,
                  })
                }

                return filtered
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id={`input-${activeCat.name}`}
              options={activeCat.options.map((str: string) => ({
                inputValue: '',
                title: str,
              }))}
              getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                  return option
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                  return option.inputValue
                }
                // Regular option
                return option.title
              }}
              renderOption={(option) => option.title}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label={activeCat.name} />
              )}
              style={{ width: 200 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
        {devices.length > 0 && !!value && (
          <Button onClick={handleSendRequest} color="primary">
            Send Request
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
