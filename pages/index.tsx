import React from 'react'
import Link from 'next/link'
import { useAuth } from '../auth'
import { useRouter } from 'next/dist/client/router'
import Alert from '@material-ui/lab/Alert'

const MainPage = () => {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <>
      <div style={{ padding: '40px' }}>
        <p>{`User ID: ${user ? user.uid : 'no user signed in'}`}</p>
        {router.query.msg ? (
          <Alert severity="error">
            There was a mistake: {router.query.msg}
          </Alert>
        ) : null}

        <p>
          <Link href="/authenticated">
            <a>Go to authenticated route</a>
          </Link>
        </p>
        <p>
          <Link href="/login">
            <a>Login</a>
          </Link>
        </p>
      </div>
    </>
  )
}

export default MainPage
