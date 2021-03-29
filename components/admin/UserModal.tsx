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
import React, { useState } from 'react'
import { Alert } from '@material-ui/lab'

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

export default function UserDialog(props: { user: any; clear: () => void }) {
  const classes = useStyles()

  // used for navigation an query params
  const router = useRouter()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const user: { email: string; role: roles; uid: string } = props.user

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
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
      .post('/api/deleteUser', { uid: user.uid })
      .then((res) => {
        if (res.status === 200) {
          setShowConfirmationDialog(false)
          props.clear()
          router.replace('/admin?mode=del&user=' + encodeURI(user.email))
        }
      })
      .catch(() =>
        enqueueSnackbar('Failed to delete user ' + user.email, {
          variant: 'error',
        })
      )
  }

  const handleRoleChange = () => {
    axios
      .post('/api/changeRole', { uid: user.uid, newRole: roleState })
      .then((res) => {
        if (res.status === 200) {
          setShowConfirmationDialog(false)
          props.clear()
          router.replace(
            '/admin?mode=chmod&user=' +
              encodeURI(user.email) +
              '&role=' +
              roleState
          )
        }
      })
      .catch(() =>
        enqueueSnackbar(
          'Failed to change role of ' + user.email + ' to ' + roleState,
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

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'md'}
      open={!!user}
      onClose={props.clear}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">
        Update {user?.email} ({user?.role})
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info">This user is not verified</Alert>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.root}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Change Role
                </Typography>
                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label">
                    new Role
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={roleState}
                    onChange={(event) => {
                      console.log(event)
                      setRoleState(event.target.value as string)
                    }}
                  >
                    {Object.values(roles)
                      .filter(
                        (val: string) =>
                          val !== user?.role && val !== roles.Admin
                      )
                      .map((val: string) => (
                        // prevents promoting users to Admin
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
                <Dialog
                  fullWidth={true}
                  maxWidth={'sm'}
                  open={showConfirmationDialog}
                  onClose={() => setShowConfirmationDialog(false)}
                  aria-labelledby="dialog-confirmation-title"
                >
                  <DialogTitle id="dialog-confirmation-title">
                    Confirm deletion of {user?.email}
                  </DialogTitle>

                  <DialogContent>
                    <Typography variant="subtitle1" component="p">
                      This action cannot be reversed.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleDelete}
                      className={classes.warningBG}
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => setShowConfirmationDialog(false)}
                      color="secondary"
                    >
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => setShowConfirmationDialog(true)}
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
        <Button onClick={props.clear} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
/* 
  return (
    <div style={{ textAlign: 'center' }}>
      <Modal isOpen={!!user.email} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update {user.email}</ModalHeader>
        <ModalBody>
          <div>
            <div>
              <FormGroup>
                <Label for="exampleSelect">
                  Change role <em>{user.role}</em> to{' '}
                </Label>
                <Input
                  type="select"
                  name="select"
                  id="exampleSelect"
                  value={roleState}
                  onChange={(event) => setRoleState(event.target.value)}
                >
                  {Object.values(roles)
                    .filter((val: string) => val !== user.role)
                    .map((val: string) =>
                      // prevents promoting users to Admin
                      val === roles.Admin ? null : (
                        <option key={val}>{val}</option>
                      )
                    )}
                </Input>
              </FormGroup>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Button color="warning" onClick={changeRole}>
                Update Role
              </Button>
            </div>
          </div>
          <hr />
          <div style={{ textAlign: 'center' }}>
            <Button color="danger" onClick={toggleNested}>
              Delete User
            </Button>
          </div>
          <Modal
            isOpen={nestedModal}
            toggle={toggleNested}
            onClosed={closeAll ? toggle : undefined}
            charCode="x"
          >
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              Do you want to proceed to delete <strong>{user.email}</strong>?
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={deleteUser}>
                Delete User
              </Button>
              <Button color="secondary" onClick={toggleNested}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default UserModal
 */
