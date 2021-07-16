import {
  Typography,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Grid,
} from '@material-ui/core'
import ShareIcon from '@material-ui/icons/Share'
import React, { FC } from 'react'
import Poll from 'lib/types/Poll'
import NextLink from 'next/link'
import { useConfirm } from 'material-ui-confirm'
import { db } from 'lib/app'
import { mutate } from 'swr'
import { useSnackbar } from 'notistack'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { domains } from 'lib/types/config'

const FoodleOverviewItem: FC<Poll> = ({
  active,
  title,
  id,
  submissions,
}: Poll) => {
  const confirm = useConfirm()

  const { enqueueSnackbar } = useSnackbar()

  const handleUpdate = (newObject: Partial<Poll>) => {
    db.collection('polls')
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
        <Grid container justify="space-between" direction="row">
          <Grid item>
            <NextLink href={'/foodle/' + id}>
              <Button
                size="small"
                color="primary"
                variant="contained"
                style={{ marginRight: '0.5rem' }}
              >
                View
              </Button>
            </NextLink>
            <CopyToClipboard
              text={`https://${domains.short}/f/${id}`}
              onCopy={() =>
                enqueueSnackbar('Successfully copied link!', {
                  variant: 'success',
                })
              }
            >
              <Button size="small" color="primary">
                <ShareIcon />
                Share
              </Button>
            </CopyToClipboard>
          </Grid>
          <Grid item>
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
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  )
}

export default FoodleOverviewItem
