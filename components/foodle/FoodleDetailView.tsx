import { Typography, Button, Link, Box } from '@material-ui/core'
import React, { useState } from 'react'
import Poll from 'lib/types/Poll'
import { db } from 'lib/app'
import { mutate } from 'swr'
import dayjs, { Dayjs } from 'dayjs'
import CalendarView from './CalendarView'
import { useConfirm } from 'material-ui-confirm'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSnackbar } from 'notistack'
import { NextPage } from 'next'
import { domains } from 'lib/types/config'
import { useAuth } from 'components/auth'
import roles from 'lib/auth/roles'
import { Alert, AlertTitle } from '@material-ui/lab'
import FoodleDetailTable from './FoodleDetailTable'

type Props = {
  poll: Poll
}

export type FieldValues = { [key: string]: boolean | string }

const FoodleDetailView: NextPage<Props> = ({
  poll: {
    active,
    title,
    id,
    submissions,
    options,
    creatorID,
    link,
    location,
    askForContactDetails,
  },
}: Props) => {
  const [activeDate, setActiveDate] = useState<Dayjs | undefined>(undefined)

  const filteredSubmissions = submissions.filter((s) => s.active)

  const { user } = useAuth()

  const confirm = useConfirm()

  const handleUpdate = (newObject: Partial<Poll>) => {
    db.collection('polls')
      .doc(id)
      .update(newObject)
      .then(() => mutate(id))
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

  const { enqueueSnackbar } = useSnackbar()

  return (
    <>
      <Box>
        <Box display="flex" justifyContent="space-between">
          <Typography gutterBottom variant="h4" component="h3">
            Scheduling Poll for: {title} {!active && '[inactive]'}
          </Typography>
          <CopyToClipboard
            text={`https://${domains.short}/f/${id}`}
            variant="contained"
            onCopy={() =>
              enqueueSnackbar('Successfully copied link!', {
                variant: 'success',
              })
            }
          >
            <Button color="primary" style={{ height: 'fit-content' }}>
              Copy public share Link
            </Button>
          </CopyToClipboard>
        </Box>
        <Typography variant="body2" gutterBottom>
          {filteredSubmissions.length} Submission[s]
        </Typography>

        {location && (
          <Typography variant="body2" gutterBottom>
            Intended Location: {location}
          </Typography>
        )}
        {link && (
          <>
            <Typography variant="body2">
              The initiator of this poll has provided additional information:
            </Typography>
            <Link href={link} target="_blank" rel="noreferrer">
              {link}
            </Link>
          </>
        )}
      </Box>
      <CalendarView
        dates={options.map((option) => dayjs(option.toDate()))}
        setActiveDate={setActiveDate}
      />
      <Box>
        <FoodleDetailTable
          activeDate={activeDate}
          poll={{
            options,
            askForContactDetails,
            submissions,
            id,
            creatorID,
            active,
          }}
          user={user}
        />
        <Alert severity="info">
          <AlertTitle>Privacy Notice:</AlertTitle>
          If you send a submission, your choices and your Name will be publicly
          visible on this page. You may use a pseudonym of course, although this
          may make choosing a date more difficult for the organizer. You can
          retract your submission at any point using the deactivate button next
          to your submission. Note that this will remove your Submission from
          public display, but not from the Database itself. If you wish to have
          your submission removed completely, you can contact{' '}
          <Link href="mailto:dev@arbeitskreis.video">
            dev-at-arbeitskreis-dot-video
          </Link>
        </Alert>
        {askForContactDetails && (
          <Alert severity="info">
            The Creator of this Poll has asked Submitters to provide a email
            address via which you can be contacted once a date has been
            selected. Only the Creator and Admins will be able to view your
            address.
          </Alert>
        )}
        <Box display="flex" justifyContent="space-between">
          {askForContactDetails &&
            user &&
            (user.role === roles.Admin || user.uid === creatorID) && (
              <CopyToClipboard
                text={filteredSubmissions.map((sub) => sub.email).join('; ')}
                onCopy={() =>
                  enqueueSnackbar('Copied e-Mail addresses to clipboard', {
                    variant: 'success',
                  })
                }
              >
                <Button>Copy all E-Mail addresses</Button>
              </CopyToClipboard>
            )}
          {user && (user.role === roles.Admin || user.uid === creatorID) && (
            <Box>
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
            </Box>
          )}
        </Box>
      </Box>
    </>
  )
}

export default FoodleDetailView
