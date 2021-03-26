import React, { useState } from 'react'

import nookies from 'nookies'
import { firebaseAdmin } from '../firebaseAdmin'
import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next'
import roles from '../lib/auth/roles'
import { Button, Table } from 'reactstrap'
import ModalUser from '../components/admin/user.modal'
import Done from '@material-ui/icons/Done'
import styles from '../styles/admin.module.css'

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

const AdminPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [user, setUser] = useState({})

  return (
    <div style={{ margin: 'auto', maxWidth: '40rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>
        Admin-Dashboard
      </h1>
      <h2>Registered users</h2>
      <div className={styles.tablewrap} style={{ overflow: 'auto' }}>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>E-Mail</th>
              <th>verified</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Change Properties</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(roles).map((val) =>
              props.users
                .filter((user) => user.role === val)
                .map((user) => (
                  <tr key={user.email}>
                    <th scope="row"></th>
                    <td>{user.email}</td>
                    <td>{user.emailVerified && <Done />}</td>
                    <td>{user.role}</td>
                    <td
                      style={{
                        padding: 0,
                        textAlign: 'right',
                        verticalAlign: 'inherit',
                      }}
                    >
                      {val === roles.Admin ? null : (
                        <Button onClick={() => setUser(user)}>Update</Button>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </Table>
      </div>
      <ModalUser user={user} clear={() => setUser({})}></ModalUser>
    </div>
  )
}

export default AdminPage
