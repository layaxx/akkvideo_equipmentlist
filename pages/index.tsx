import React from 'react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useRouter } from 'next/dist/client/router'

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    minHeight: 200,
    margin: '1rem',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
})

const MainPage = () => {
  const classes = useStyles()
  const router = useRouter()

  return (
    <>
      <h1>Arbeitskreis Video</h1>
      <h2>Internal administration platform</h2>
      {router.query.msg ? (
        <Alert severity="error">An error occurred: {router.query.msg}</Alert>
      ) : null}
      <Grid container spacing={3} justify="space-evenly">
        <Grid item xs={12} sm={6}>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              >
                devices
              </Typography>
              <Typography variant="h5" component="h2">
                Technikverwaltung
              </Typography>
              <Typography variant="body2" component="p">
                Overview over registered Devices.
                <br />
                Add or edit devices (Admin only).
              </Typography>
            </CardContent>
            <CardActions>
              <Link href="/technik">
                <Button size="small">Access</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              >
                users
              </Typography>
              <Typography variant="h5" component="h2">
                Nutzerverwaltung
              </Typography>
              <Typography variant="body2" component="p">
                Overview over registered Users.
                <br />
                Delete accounts and change access rights.
              </Typography>
            </CardContent>
            <CardActions>
              <Link href="/admin">
                <Button size="small">Access (Admin only)</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card className={classes.root} variant="outlined">
            <CardContent>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              >
                you
              </Typography>
              <Typography variant="h5" component="h2">
                Your Account
              </Typography>
              <Typography variant="body2" component="p">
                Overview over your account details.
                <br />
                Delete your account, verify your e-Mail address.
              </Typography>
            </CardContent>
            <CardActions>
              <Link href="/admin">
                <Button size="small">Access</Button>
              </Link>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default MainPage
