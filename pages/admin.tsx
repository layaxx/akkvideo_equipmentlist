import React, { useState } from 'react'
import {
  Button,
  makeStyles,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core'
import nookies from 'nookies'
import { firebaseAdmin } from '../firebaseAdmin'
import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next'
import roles from '../lib/auth/roles'
import { Table } from 'reactstrap'
import ModalUser from '../components/admin/UserDialog'
import Done from '@material-ui/icons/Done'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx)
    var isAdmin = false
    await firebaseAdmin
      .auth()
      .verifyIdToken(cookies.token)
      .then((claims) => {
        if (claims.role === roles.Admin) {
          isAdmin = true
        }
      })

    if (!isAdmin) {
      return {
        redirect: {
          permanent: false,
          destination: '/?msg=InsufficientAuthentication',
        },
        // `as never` is required for correct type inference
        // by InferGetServerSidePropsType below
        props: {} as never,
      }
    }

    const userList = await firebaseAdmin.auth().listUsers()

    const users = userList.users.map((user) => {
      return {
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.customClaims?.role || roles.Public,
        uid: user.uid,
      }
    })

    return {
      props: { users: users },
    }
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    console.log(err)
    return {
      redirect: {
        permanent: false,
        destination: '/login?redirect=admin',
      },
      // `as never` is required for correct type inference
      // by InferGetServerSidePropsType below
      props: {} as never,
    }
  }
}

interface IUser {
  email: string
  emailVerified: boolean
  role: roles
}

const useStyles = makeStyles({
  table: {
    minWidth: 630,
  },
})

const AdminPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [user, setUser]: [IUser | null, any] = useState(null)
  const classes = useStyles()

  return (
    <div style={{ margin: 'auto', maxWidth: '45rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>
        Admin-Dashboard
      </h1>
      <h2>Registered users</h2>
      <TableContainer style={{ overflow: 'auto' }}>
        <Table className={classes.table} aria-label="registered users">
          <TableHead>
            <TableRow>
              <TableCell align="right">E-Mail</TableCell>
              <TableCell align="right">Verified</TableCell>
              <TableCell align="right">Role</TableCell>
              <TableCell align="right">Change Properties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(roles).map((val) =>
              props.users
                .filter((userParam) => userParam.role === val)
                .map((userParam) => (
                  <TableRow key={userParam.email}>
                    <TableCell component="th" scope="row" align="right">
                      {userParam.email}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {userParam.emailVerified && <Done />}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {userParam.role}
                    </TableCell>
                    <TableCell
                      align="right"
                      component="th"
                      scope="row"
                      style={{
                        padding: 0,
                        verticalAlign: 'inherit',
                      }}
                    >
                      {val === roles.Admin ? null : (
                        <Button
                          variant="outlined"
                          onClick={() => setUser(userParam)}
                        >
                          Update
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalUser user={user} clear={() => setUser(null)}></ModalUser>
    </div>
  )
}

export default AdminPage
