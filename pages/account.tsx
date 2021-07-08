import React, { FC } from 'react'
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

const AccountPage: FC = () => {
  const { user } = useAuth()

  const router = useRouter()

  if (!user) {
    router.push('/?msg=You%20need%20to%20log%20in%20to%20access%20this%20page')
    return null
  }

  const role: roles = user!.role
  const lookup = {
    [roles.Admin]: <AdminRoleInfo />,
    [roles.Moderator]: null,
    [roles.Member]: null,
    [roles.Public]: <PublicRoleInfo />,
  }
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
      <h1>Hello, {user!.email}!</h1>
      {!user!.emailVerified ? (
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
        Your role is <em>{user!.role.toUpperCase() ?? roles.Public}</em>:
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
