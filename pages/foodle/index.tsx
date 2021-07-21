import React from 'react'
import { Box, Button, List, ListItem, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { Alert } from '@material-ui/lab'
import { useAuth } from 'components/auth'
import FoodleOverviewItem from 'components/foodle/FoodleOverviewItem'
import Poll from 'lib/types/Poll'
import { db } from 'lib/app'
import Link from 'next/link'
import useSWR from 'swr'
import { NextPage } from 'next'
import roles from 'lib/auth/roles'

const FoodleOverviewPage: NextPage = () => {
  const { user } = useAuth()

  const fetcher = async () => {
    return (
      await db
        .collection('polls')
        .where('hidden', '==', false)
        .get()
        .catch(() => {
          throw new Error('Failed to fetch polls ')
        })
    ).docs.map(
      (entry) =>
        ({
          ...entry.data(),
          id: entry.id,
        } as Poll)
    )
  }

  const { data, error } = useSWR('all', fetcher)

  return (
    <>
      <Typography component="h1" variant="h3" gutterBottom>
        AK Video - Foodle
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        A self developed doodle alternative
      </Typography>

      <Typography component="h4" variant="h5" gutterBottom>
        What is Foodle?
      </Typography>

      <Typography variant="body1" gutterBottom>
        Foodle is an alternative for the online meeting scheduling tool Doodle.
        To start a Poll, you have to be logged in and you have to have a role of
        at least &quot;Member&quot;. To submit a response to a Poll, you do not
        need to be logged in, iff you have received a direct share link to the
        poll you wish to participate in.
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Why reinvent the wheel?
      </Typography>
      <Typography variant="body1" gutterBottom>
        This self developed Version allows us to have greater control over
        features, user-experience and privacy. There is no Tracking, there are
        no ads, unless you are logged in there aren&apos;t even any cookies
        saved on your device. (If you want to be logged in, Cookies are
        required, but are still only used for Log-in status and not for tracking
        or similar purposes.). Also reinventing the wheel can be worth it for
        the experience,, especially when the wheel is not too complex.
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Where does the name come from?
      </Typography>
      <Typography variant="body1" gutterBottom>
        Foodle is a combination of Firebase (our current backend service) and
        Doodle (the tool that was the inspiration for this).
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Limitations?
      </Typography>
      <Typography variant="body1" gutterBottom>
        Currently there is no support for any type of e-mail notifications.
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Beta-Version
      </Typography>
      <Typography variant="body1" gutterBottom>
        The entire site and this module specifically are still under active
        development. If you have questions or notice anything, don&apos;t
        hesitate to message us:{' '}
        <Link href="mailto:dev@arbeitskreis.video">
          dev -at- arbeitskreis -dot- video
        </Link>
      </Typography>

      <Typography component="h4" variant="h5" gutterBottom>
        Poll Overview:
      </Typography>

      {!user || !user.role || user.role === roles.Public ? (
        <Alert severity="info">
          You are currently not logged in. This means you only have access to
          polls to which you have received a direct link.
        </Alert>
      ) : (
        <Box>
          {error && <Alert severity="error">Failed to fetch Polls.</Alert>}

          {!error && !data && <Alert severity="info">Loading</Alert>}

          {data?.length === 0 && !!data && (
            <Alert severity="info">No Polls available.</Alert>
          )}

          {!error && !!data && (
            <List>
              {data.reverse().map((poll) => (
                <ListItem key={poll.id}>
                  <FoodleOverviewItem {...poll}></FoodleOverviewItem>
                </ListItem>
              ))}
            </List>
          )}
          <Link href="/foodle/add">
            <Button color="primary" variant="contained">
              <AddIcon /> Add a new Poll
            </Button>
          </Link>
        </Box>
      )}
    </>
  )
}

export default FoodleOverviewPage
