import {
  CssBaseline,
  Typography,
  TextField,
  makeStyles,
  Button,
  Container,
  Avatar,
} from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import React, { useState } from 'react'
import { firebaseClient } from '../firebaseClient'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/dist/client/router'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const handlePasswordReset = () => {
    if (!email || email.indexOf('@') === -1) {
      enqueueSnackbar('You need to supply a valid E-Mail address.', {
        variant: 'error',
      })
    } else {
      console.log(firebaseClient)
      firebaseClient
        .auth()
        .sendPasswordResetEmail(email)
        .then(() =>
          enqueueSnackbar('A password reset E-Mail was sent to your address.', {
            variant: 'success',
          })
        )
        .catch(() =>
          enqueueSnackbar('Password reset E-Mail could not be sent.', {
            variant: 'error',
          })
        )
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
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
