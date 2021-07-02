import React from 'react'
import { Box, Button, List, ListItem } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { Alert } from '@material-ui/lab'
import { useAuth } from '../../auth'
import firebase from 'firebase'
import FoodleOverviewItem from '../../components/foodle/FoodleOverviewItem'
import Poll from '../../lib/types/Poll'
import app from './app'
import Link from 'next/link'
import useSWR from 'swr'

const MainPage = () => {
  const { user } = useAuth()

  if (user === null) {
    return (
      <>
        <h1>AK Video - Foodle</h1>
        <h2>A self developed doodle alternative</h2>

        <Alert severity="info">
          You are currently not logged in. This means you only have access to
          polls to which you have received a direct link.
        </Alert>
      </>
    )
  }

  const fetcher = async () => {
    return (
      await firebase
        .firestore(app)
        .collection('polls')
        .where('hidden', '==', false)
        .get()
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
      <h1>AK Video - Foodle</h1>
      <h2>A self developed doodle alternative</h2>

      <Box>
        {(error || (data?.length === 0 && !!data)) && (
          <Alert severity="error">Failed to fetch Polls.</Alert>
        )}

        {!error && !data && <Alert severity="info">Loading</Alert>}

        {!error && !!data && (
          <List>
            {data.map((poll) => (
              <ListItem key={poll.id}>
                <FoodleOverviewItem poll={poll}></FoodleOverviewItem>
              </ListItem>
            ))}
          </List>
        )}
        <Link href="/foodle/add">
          <Button variant="contained">
            <AddIcon /> Add a new Poll
          </Button>
        </Link>
      </Box>
    </>
  )
}

export default MainPage
