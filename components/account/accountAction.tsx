import React, { MouseEventHandler, useState } from 'react'
import Link from 'next/link'
import { firebaseClient } from '../../firebaseClient'
import { useRouter } from 'next/dist/client/router'
import {
  Avatar,
  Button,
  Container,
  CssBaseline,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core'
import { LockOutlined } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { useAuth } from '../../auth'
import { Alert } from '@material-ui/lab'

export const useStyles = makeStyles((theme) => ({
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
  alert: {
    marginBottom: theme.spacing(3),
  },
}))

const AccountAction = ({ isRegister = false }: { isRegister?: boolean }) => {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const router = useRouter()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuth()

  const handleSubmit: MouseEventHandler = async (event) => {
    event.preventDefault()
    if (email === '') {
      enqueueSnackbar('You need to supply your username.', {
        variant: 'error',
      })
      return
    }
    if (pass === '') {
      enqueueSnackbar('You need to supply your password.', {
        variant: 'error',
      })
      return
    }
    if (isRegister) {
      firebaseClient
        .auth()
        .createUserWithEmailAndPassword(email, pass)
        .then((res) => {
          axios.post('/api/newUser', {
            token: res.user?.getIdToken(),
          })
        })
      router.push('/account')
    } else {
      firebaseClient
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(() =>
          router.push(router.query.redirect ? '/' + router.query.redirect : '/')
        )
        .catch(() =>
          enqueueSnackbar('Something went wrong. Please try again.', {
            variant: 'error',
          })
        )
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
          {isRegister ? 'Create Account' : 'Sign in'}
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
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={pass}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPass(event.target.value)
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            {isRegister ? 'Register' : 'Sign In'}
          </Button>
          {isRegister ? (
            <Grid container>
              <Grid item>
                <Link href="/login">Already have an account? Log In</Link>
              </Grid>
              <Grid item xs={12}>
                <small>
                  Once you have created an account, you need to contact
                  it@arbeitskreis.video in order to receive a clearance level
                  that will allow you to actually see and interact with content.
                </small>
              </Grid>
            </Grid>
          ) : (
            <Grid container>
              <Grid item xs>
                <Link href="/resetPassword">Forgot Password?</Link>
              </Grid>
              <Grid item>
                <Link href="/register">Don't have an account? Sign Up</Link>
              </Grid>
              <Grid item xs={12}>
                <small>
                  This action will leave a cookie on your machine. This is used
                  for authentication only and is necessary if you want to access
                  protected sites.
                </small>
              </Grid>
            </Grid>
          )}
        </form>
      </div>
    </Container>
  )
}

export default AccountAction
