import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useSnackbar } from 'notistack'
import React, { FC } from 'react'
import { useForm, useFormState } from 'react-hook-form'
import BulkEditCategoryInput from './BulkEditCategoryInput'
import BulkEditValueInput from './BulkEditValueInput'
import { IBulkEditDialogProps } from 'lib/types/device.dialog'
import Device from 'lib/types/Device'
import { db } from 'lib/app'
import { mutate } from 'swr'

const DeviceBulkEditDialog: FC<IBulkEditDialogProps> = (
  props: IBulkEditDialogProps
) => {
  const { devices, show, handleClose } = props
  const handleSendRequest = ({
    value,
    category,
  }: {
    value: string
    category: string
  }) => {
    Promise.all(
      devices.map(({ id }: Device) =>
        db
          .collection('devices')
          .doc(id)
          .update({ [category]: value })
      )
    )
      .then(() => {
        enqueueSnackbar('Documents successfully updated!', {
          variant: 'success',
        })
      })
      .catch(() => {
        enqueueSnackbar('Failed to update Devices.', {
          variant: 'error',
        })
      })

    mutate('devices-all')
    handleClose()
  }

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control } = useForm({
    defaultValues: {
      category: 'location',
      value: '',
    },
    mode: 'onChange',
  })

  const { isValid, isDirty, isSubmitting } = useFormState({ control })

  return (
    <Dialog
      disableEscapeKeyDown={devices.length > 0}
      fullWidth={true}
      maxWidth={'md'}
      open={show}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' && devices.length > 0) {
          return
        } else {
          handleClose()
        }
      }}
      aria-labelledby="bulk-edit-dialog-title"
    >
      <DialogTitle id="bulk-edit-dialog-title">Bulk Edit Devices</DialogTitle>

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
            <List dense>
              {devices.map((device, index) => (
                <ListItem key={index}>
                  <ListItemText primary={device.description} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item>
            <Typography component="h3" variant="h6">
              Edit:
            </Typography>

            <BulkEditCategoryInput
              control={control}
              name="category"
              rules={{ required: true }}
            />

            <BulkEditValueInput
              control={control}
              name="value"
              rules={{ required: true }}
              options={props.options}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>

        <Button
          onClick={handleSubmit(handleSendRequest)}
          color="primary"
          disabled={
            devices.length === 0 || !isValid || !isDirty || isSubmitting
          }
        >
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeviceBulkEditDialog
