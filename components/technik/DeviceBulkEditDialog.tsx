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
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import { Dropdown } from 'reactstrap'
import Device from '../../lib/types/Device'

export default function DeviceBulkEditDialog(props: {
  devices: Device[]
  show: boolean
  handleClose: any
}) {
  const { devices, show, handleClose } = props
  const handleSendRequest = () => {
    axios
      .post('/api/email', { devices, comments })
      .then(() => {
        enqueueSnackbar('Successfully sent Email request', {
          variant: 'success',
        })
        handleClose()
      })
      .catch(() =>
        enqueueSnackbar('Failed to send Email request', {
          variant: 'error',
        })
      )
  }

  const [comments, setComments] = useState('')

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
        <Typography component="h3" variant="h6">
          Devices:
        </Typography>
        <ul>
          {devices.map((device) => (
            <li key={device.id}>{device.description}</li>
          ))}
        </ul>
        <Typography component="h3" variant="h6">
          Edit:
        </Typography>
        <Select labelId="demo-simple-select-label" id="demo-simple-select">
          <MenuItem value={'location'}>Location</MenuItem>
          <MenuItem value={'location_prec'}>Location Precise</MenuItem>
          <MenuItem value={'container'}>Container</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        {devices.length > 0 && (
          <Button onClick={handleSendRequest} color="primary">
            Send Request
          </Button>
        )}
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
