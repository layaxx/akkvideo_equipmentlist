import { GetServerSidePropsContext } from 'next'
import React, { FC } from 'react'
import nookies from 'nookies'
import { firebaseAdmin } from '../firebaseAdmin'
import roles from '../lib/auth/roles'
import AdminRoleInfo from '../components/account/roleinfo/AdminRoleInfo'
import PublicRoleInfo from '../components/account/roleinfo/PublicRoleInfo'
import { useAuth } from '../auth'
import { Button } from '@material-ui/core'
import axios from 'axios'
import signout from '../lib/auth/signout'
import { useRouter } from 'next/dist/client/router'
import { useSnackbar } from 'notistack'
import { useConfirm } from 'material-ui-confirm'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx)
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token)

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
  const router = useRouter()
  const handleDelete = () => {
    axios
      .get('/api/deleteOwnAccount?confirm=true')
      .then(() => {
        signout()
        router.push('/')
      })
      .catch(() =>
        enqueueSnackbar('Failed to delete Account', {
          variant: 'error',
        })
      )
  }

  const confirm = useConfirm()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

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
                .then(() =>
                  enqueueSnackbar(
                    'Sent E-Mail for Verification to ' + user.email,
                    {
                      variant: 'success',
                    }
                  )
                )
                .catch(() =>
                  enqueueSnackbar('Failed to sent E-Mail to ' + user.email, {
                    variant: 'error',
                  })
                )
            }
            variant="contained"
          >
            verify e-Mail address
          </Button>
        </>
      ) : (
        <p>Your e-Mail is verified.</p>
      )}

      <h2>
        Your role is <em>{props.user.role?.toUpperCase() ?? roles.Public}</em>:
      </h2>
      <p>This means you have access to:</p>
      {lookup[role]}
      <div>
        <h2>Dangerzone:</h2>
        <Button
          onClick={() => {
            confirm({
              title: 'Dou you really want to delete your Account?',
              description:
                'This action cannot be undone. Changes you made to Devices, Polls, etc. will not be affected',
              confirmationText: 'Delete',
              confirmationButtonProps: { style: { color: 'red' } },
            })
              .then(handleDelete)
              .catch(() => undefined)
          }}
          variant="contained"
          style={{ backgroundColor: 'indianred', color: 'white' }}
        >
          Delete Account
        </Button>
      </div>
    </div>
  )
}

export default AccountPage
