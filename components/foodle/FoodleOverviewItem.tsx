import {
  Typography,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
} from '@material-ui/core'
import React from 'react'
import Poll from '../../lib/types/Poll'
import NextLink from 'next/link'
import { useConfirm } from 'material-ui-confirm'
import firebase from 'firebase'
import app from '../../pages/foodle/app'
import { mutate } from 'swr'

export default function FoodleOverviewItem({
  poll: { active, title, id, submissions },
}: {
  poll: Poll
}) {
  const confirm = useConfirm()

  const handleUpdate = (newObject: Partial<Poll>) => {
    firebase
      .firestore(app)
      .collection('polls')
      .doc(id)
      .update(newObject)
      .then(() => mutate('all'))
  }

  const confirmReactivate = () => {
    confirm({
      description: `Do you really want to reactivate the ${title} Poll? People will be able to vote on dates again.`,
    })
      .then(() => handleUpdate({ active: true }))
      .catch(() => undefined)
  }
  const confirmDeactivate = () => {
    confirm({
      description: `Do you really want to deactivate the ${title} Poll? People will not be able to vote on dates anymore.`,
    })
      .then(() => handleUpdate({ active: false }))
      .catch(() => undefined)
  }

  const confirmDelete = () => {
    confirm({
      description: `Do you really want to delete the ${title} Poll? This action cannot be undone. `,
    })
      .then(() => handleUpdate({ hidden: true }))
      .catch(() => undefined)
  }

  return (
    <Card style={{ flexGrow: 1 }}>
      <CardActionArea>
        <NextLink href={'/foodle/' + id}>
          <CardContent className={!active ? 'grayed-out' : undefined}>
            <Typography gutterBottom variant="h5" component="h3">
              {title} {!active && '[inactive]'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {submissions.length} Submission[s]
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ID: {id}
            </Typography>
          </CardContent>
        </NextLink>
      </CardActionArea>
      <CardActions>
        {active ? (
          <Button size="small" onClick={confirmDeactivate}>
            Deactivate
          </Button>
        ) : (
          <Button
            size="small"
            onClick={confirmReactivate}
            style={{ backgroundColor: 'forestgreen' }}
          >
            Reactivate
          </Button>
        )}

        <Button
          size="small"
          style={{
            color: 'indianred',
          }}
          onClick={confirmDelete}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}
