import { GetServerSidePropsContext } from 'next'
import React, { FC } from 'react'
import nookies from 'nookies'
import { firebaseAdmin } from '../firebaseAdmin'
import roles from '../lib/auth/roles'
import AdminRoleInfo from '../components/account/roleinfo/admin'
import PublicRoleInfo from '../components/account/roleinfo/public'
import { Button } from 'reactstrap'
import { useAuth } from '../auth'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx)
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token)
    /*     firebaseAdmin
      .auth()
      .setCustomUserClaims(token.uid, { role: roles.Admin })
      .then(() => {
        // The new custom claims will propagate to the user's ID token the
        // next time a new one is issued.
      }) */
    // const { uid, email } = token;

    // the user is authenticated!
    // FETCH STUFF HERE

    return {
      props: { user: token },
    }
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    return {
      redirect: {
        permanent: false,
        destination: '/login?redirect=account',
      },
      // `as never` is required for correct type inference
      // by InferGetServerSidePropsType below
      props: {} as never,
    }
  }
}

const AccountPage: FC = (props: any) => {
  const role: roles = props.user.role || roles.Public
  const lookup = {
    [roles.Admin]: <AdminRoleInfo />,
    [roles.Moderator]: null,
    [roles.Member]: null,
    [roles.Public]: <PublicRoleInfo />,
  }
  const { user } = useAuth()
  return (
    <div style={{ marginTop: '3rem' }}>
      <h1>Hello, {props.user.email}!</h1>
      {!props.user.email_verified ? (
        <>
          <p>
            Your E-Mail address is currently <strong>not verified</strong>
          </p>
          <Button
            onClick={() =>
              user
                ?.sendEmailVerification()
                .then(() => alert('email sent'))
                .catch(() => alert('failed to send email'))
            }
          >
            verify Email
          </Button>
        </>
      ) : (
        <p>Your e-mail is verified.</p>
      )}

      <h2>Roles:</h2>
      <p>
        Your current Role is <em>{props.user.role}</em>. This means you have
        access to:
      </p>
      {lookup[role]}
    </div>
  )
}

export default AccountPage
