import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import axios from 'axios'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import React, { FC, useState } from 'react'
import Device from 'lib/types/Device'

type Props = {
  devices: Device[]
  show: boolean
  handleClose: () => void
}

const DeviceLendingDialog: FC<Props> = ({
  devices,
  show,
  handleClose,
}: Props) => {
  const handleSendRequest = () => {
    axios
      .post('/api/email', { devices, fromDate, untilDate, comments })
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
  const [fromDate, setFromDate] = useState(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  )
  const [untilDate, setUntilDate] = useState(
    dayjs().add(2, 'days').format('YYYY-MM-DD')
  )
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
          Details:
        </Typography>
        <Grid container justify="space-evenly">
          <Grid item>
            <TextField
              id="date"
              label="von"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item>
            <TextField
              id="date"
              label="bis"
              type="date"
              value={untilDate}
              onChange={(event) => setUntilDate(event.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <TextField
          label="Comments"
          value={comments}
          fullWidth
          onChange={(event) => setComments(event.target.value)}
        ></TextField>
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

export default DeviceLendingDialog
