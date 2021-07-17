import React, { useState } from 'react'
import {
  Button,
  makeStyles,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  Typography,
} from '@material-ui/core'
import nookies from 'nookies'
import { firebaseAdmin } from 'lib/firebaseAdmin'
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  GetServerSideProps,
  NextPage,
} from 'next'
import roles from 'lib/auth/roles'
import ModalUser from 'components/admin/UserDialog'
import CheckIcon from '@material-ui/icons/Check'

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  try {
    const cookies = nookies.get(ctx)
    const { role } = await firebaseAdmin
      .auth()
      .verifyIdToken(cookies.token)
      .then((claims) => claims)

    if (role !== roles.Admin) {
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
      props: { users },
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

export interface IUser {
  email: string | undefined
  emailVerified: boolean
  role: roles
  uid: string
}

const useStyles = makeStyles({
  table: {
    minWidth: 630,
  },
})

const AdminPage: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [activeUser, setActiveUser] = useState<IUser | null>(null)
  const classes = useStyles()

  return (
    <div style={{ margin: 'auto', maxWidth: '45rem' }}>
      <Typography component="h1" variant="h3" gutterBottom>
        Admin-Dashboard
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Registered users
      </Typography>

      <TableContainer style={{ overflow: 'auto' }}>
        <Table className={classes.table} aria-label="registered users">
          <TableHead>
            <TableRow>
              <TableCell align="right">E-Mail</TableCell>
              <TableCell align="right">Verified</TableCell>
              <TableCell align="right">Role</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(roles).map((role) =>
              props.users
                .filter((user: IUser) => user.role === role)
                .map((user: IUser) => (
                  <TableRow key={user.email}>
                    <TableCell component="th" scope="row" align="right">
                      {user.email}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {user.emailVerified && <CheckIcon />}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {user.role}
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
                      {role === roles.Admin ? null : (
                        <Button
                          variant="outlined"
                          onClick={() => setActiveUser(user)}
                        >
                          manage
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalUser
        user={activeUser}
        close={() => setActiveUser(null)}
      ></ModalUser>
    </div>
  )
}

export default AdminPage
