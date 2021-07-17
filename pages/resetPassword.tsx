import {
  CssBaseline,
  Typography,
  TextField,
  Button,
  Container,
  Avatar,
} from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import React, { ReactElement, useState } from 'react'
import { firebaseClient } from 'lib/firebaseClient'
import { useSnackbar } from 'notistack'
import { useAuth } from 'components/auth'
import { Alert } from '@material-ui/lab'
import { useStyles } from 'components/account/accountAction'

export default function ResetPasswordPage(): ReactElement {
  const [email, setEmail] = useState('')
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuth()

  const handlePasswordReset = () => {
    if (!email || email.indexOf('@') === -1) {
      enqueueSnackbar('You need to supply a valid E-Mail address.', {
        variant: 'error',
      })
    } else {
      firebaseClient
        .auth()
        .sendPasswordResetEmail(email)
        .then(() =>
          enqueueSnackbar(
            'If this user exists, they will have received a password-reset e-mail.',
            {
              variant: 'success',
            }
          )
        )
        .catch((error) => {
          if (error.code === 'auth/user-not-found') {
            // try to leak as little information about registered users as possible
            enqueueSnackbar(
              'If this user exists, they will have received a password-reset e-mail.',
              {
                variant: 'success',
              }
            )
          } else {
            enqueueSnackbar('Password reset E-Mail could not be sent.', {
              variant: 'error',
            })
          }
        })
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {!!user && (
          <Alert severity="info" className={classes.alert}>
            You are currently logged in as {user?.email}.
          </Alert>
        )}
        <Avatar className={classes.avatar}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(event.target.value)
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handlePasswordReset}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </Container>
  )
}
