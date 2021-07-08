import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  createStyles,
  makeStyles,
  Theme,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CardActions,
  CardContent,
  Button,
  Card,
} from '@material-ui/core'
import roles from '../../lib/auth/roles'
import axios from 'axios'
import { useRouter } from 'next/dist/client/router'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { Alert } from '@material-ui/lab'
import { useConfirm } from 'material-ui-confirm'
import { IUser } from '../../pages/admin'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 275,
      padding: 10,
      '& .MuiButton-root': { margin: 5 },
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    noEdit: {
      '& .Mui-disabled': {
        color: 'gray',
      },
    },
    formControl: {
      minWidth: 120,
    },
    warningBG: {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.background.default,
    },
  })
)

export default function UserDialog({
  user,
  close: close,
}: {
  user: IUser | null
  close: () => void
}) {
  const classes = useStyles()

  // used for navigation an query params
  const router = useRouter()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const [roleState, setRoleState] = useState(roles.Member as string)

  if (user?.role === roles.Member && roleState === roles.Member) {
    setRoleState(roles.Public)
  }
  if (
    (user?.role === roles.Public && roleState === roles.Public) ||
    (user?.role === roles.Moderator && roleState === roles.Moderator)
  ) {
    setRoleState(roles.Member)
  }

  const handleDelete = () => {
    axios
      .post('/api/deleteUser', { uid: user?.uid })
      .then((res) => {
        if (res.status === 200) {
          close()
          router.replace('/admin?mode=del&user=' + encodeURI(user?.email ?? ''))
        }
      })
      .catch(() =>
        enqueueSnackbar('Failed to delete user ' + user?.email, {
          variant: 'error',
        })
      )
  }

  const handleRoleChange = () => {
    axios
      .post('/api/changeRole', { uid: user?.uid, newRole: roleState })
      .then((res) => {
        if (res.status === 200) {
          close()
          router.replace(
            '/admin?mode=chmod&user=' +
              encodeURI(user?.email ?? '') +
              '&role=' +
              roleState
          )
        }
      })
      .catch(() =>
        enqueueSnackbar(
          'Failed to change role of ' + user?.email + ' to ' + roleState,
          {
            variant: 'error',
          }
        )
      )
  }

  const getLabel = () => {
    switch (roleState) {
      case roles.Public:
        return 'Downgrade'
      case roles.Member:
        if (user?.role === roles.Public) {
          return 'Upgrade'
        } else {
          return 'Downgrade'
        }
      case roles.Moderator:
        if (user?.role === roles.Admin) {
          return 'Downgrade'
        } else {
          return 'Upgrade'
        }
    }
    return ''
  }

  useEffect(() => {
    if (router.query.mode === 'del' && router.query.user) {
      enqueueSnackbar('Successfully deleted user ' + router.query.user, {
        variant: 'success',
      })
      router.replace('/admin', undefined, { shallow: true })
    } else if (
      router.query.mode === 'chmod' &&
      router.query.user &&
      router.query.role
    ) {
      enqueueSnackbar(
        'Successfully changed role of ' +
          router.query.user +
          ' to ' +
          router.query.role,
        {
          variant: 'success',
        }
      )
      router.replace('/admin', undefined, { shallow: true })
    }
  }, [router])

  const confirm = useConfirm()

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'md'}
      open={!!user}
      onClose={close}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">
        Update {user?.email} ({user?.role})
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {!user?.emailVerified && (
            <Grid item xs={12}>
              <Alert severity="info">This user is not verified</Alert>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <Card className={classes.root}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Change Role
                </Typography>
                <FormControl className={classes.formControl}>
                  <InputLabel id="select-role-label">new Role</InputLabel>
                  <Select
                    labelId="select-role-label"
                    id="select-role"
                    value={roleState}
                    onChange={(event) => {
                      setRoleState(event.target.value as string)
                    }}
                  >
                    {Object.values(roles)
                      .filter(
                        // prevents promoting users to Admin
                        (val: string) =>
                          val !== user?.role && val !== roles.Admin
                      )
                      .map((val: string) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={handleRoleChange}
                  variant="contained"
                  color="primary"
                >
                  Change Role ({getLabel()})
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.root}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Dangerzone
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() =>
                    confirm({
                      title: `Do you really want to delete ${user?.email}'s account?`,
                      description:
                        'This action cannot be undone. Changes they made to Devices, Polls, etc. will not be affected',
                      confirmationText: 'Delete',
                      confirmationButtonProps: { style: { color: 'red' } },
                    })
                      .then(handleDelete)
                      .catch(() => undefined)
                  }
                  className={classes.warningBG}
                  variant="contained"
                >
                  Delete User
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
