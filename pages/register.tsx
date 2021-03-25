/* import React, { useState } from 'react'
import Link from 'next/link'
import { firebaseClient } from '../firebaseClient'
import { useRouter } from 'next/dist/client/router'
import { Button, Card, CardContent, TextField } from '@material-ui/core'
import axios from 'axios'
import styles from '../styles/login.module.css'
import { ArrowBack } from '@material-ui/icons'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const router = useRouter()
  return (
    <div>
      <h1>This is an internal site.</h1>
      <h2>To continue, please authenticate.</h2>
      <Link href="/">
        <a>
          <ArrowBack></ArrowBack>
          Go back to home page
        </a>
      </Link>
      <br />
      <Card className={styles.card}>
        <CardContent>
          <form noValidate autoComplete="off">
            <div>
              <strong>Register new Account</strong>
              <TextField
                fullWidth
                id="input-email"
                label="E-Mail"
                value={email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(event.target.value)
                }}
              />
              <TextField
                fullWidth
                id="input-password"
                label="password"
                type="password"
                value={pass}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPass(event.target.value)
                }}
              />
            </div>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={async (event) => {
                event.preventDefault()
                await firebaseClient
                  .auth()
                  .createUserWithEmailAndPassword(email, pass)
                  .then((res) => {
                    axios.post('/api/newUser', {
                      token: res.user?.getIdToken(),
                    })
                  })
                router.push('/account')
              }}
            >
              Create Account
            </Button>
          </form>
        </CardContent>
        <hr />
        <CardContent>
          <small>
            Once you have created an account, you need to contact
            it@arbeitskreis.video in order to receive a clearance level that
            will allow you to actually see and interact with content.
          </small>
        </CardContent>
        <hr />
        <CardContent>
          <p>
            Already have an Account?
            <br />
            <Link href="/login">
              <a>Log in here.</a>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
 */

import React from 'react'
import AccountAction from '../components/account/accountAction'

const RegisterPage = (_props: any) => {
  return <AccountAction isRegister />
}

export default RegisterPage
