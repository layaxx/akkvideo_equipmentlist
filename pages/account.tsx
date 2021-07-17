import React from 'react'
import roles from 'lib/auth/roles'
import AdminRoleInfo from 'components/account/roleinfo/AdminRoleInfo'
import PublicRoleInfo from 'components/account/roleinfo/PublicRoleInfo'
import { useAuth } from 'components/auth'
import { Box, Button, Typography } from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import axios from 'axios'
import signout from 'lib/auth/signout'
import { useRouter } from 'next/dist/client/router'
import { useSnackbar } from 'notistack'
import { useConfirm } from 'material-ui-confirm'
import { NextPage } from 'next'
import { Alert } from '@material-ui/lab'

const AccountPage: NextPage = () => {
  const { user } = useAuth()

  const router = useRouter()

  const role: roles = user?.role ?? roles.Public
  const lookup = {
    [roles.Admin]: <AdminRoleInfo />,
    [roles.Moderator]: null,
    [roles.Member]: null,
    [roles.Public]: <PublicRoleInfo />,
  }
  const handleDelete = () => {
    axios
      .delete('/api/deleteOwnAccount?confirm=true')
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

  if (!user) {
    return (
      <Alert severity="error">
        You need to be logged in in order to access this page.
      </Alert>
    )
  }

  return (
    <>
      <Box component="section" mb={2}>
        <Typography component="h1" variant="h3" gutterBottom>
          Hello, {user?.email}!
        </Typography>
        {!user?.emailVerified ? (
          <>
            <Typography variant="body1">
              Your E-Mail address is currently <em>not verified</em>.
            </Typography>
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
              color="primary"
              variant="contained"
            >
              verify e-Mail address
            </Button>
          </>
        ) : (
          <Typography variant="body1">
            <CheckIcon />
            Your e-Mail address is verified.
          </Typography>
        )}
      </Box>
      <Box component="section" mb={2}>
        <Typography component="h2" variant="h4" gutterBottom>
          Your role is{' '}
          <span className="underlines">
            {user?.role?.toUpperCase() ?? roles.Public}
          </span>
          :
        </Typography>
        <Typography variant="body1">This means you have access to:</Typography>
        {lookup[role]}
      </Box>

      <Box component="section" mb={2}>
        <Typography component="h2" variant="h4" gutterBottom>
          Dangerzone:
        </Typography>
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
      </Box>
    </>
  )
}

export default AccountPage
