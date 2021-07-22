import {
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Button,
  TableFooter,
  useTheme,
  Link,
  makeStyles,
  Box,
} from '@material-ui/core'
import React, { useState } from 'react'
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'
import Poll, { Submission } from 'lib/types/Poll'
import { useForm, Controller, useWatch } from 'react-hook-form'
import firebase from 'firebase/app'
import { db } from 'lib/app'
import { mutate } from 'swr'
import { generateRange } from 'lib/helper'
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

type Props = {
  poll: Poll
}

const useStyles = makeStyles((theme) => {
  return {
    optimalChoice: {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
    optimalChoiceSubtle: {
      boxShadow:
        'inset 2px 0px ' +
        theme.palette.primary.light +
        ', inset -2px 0px ' +
        theme.palette.primary.light,
    },
    optimalChoiceSubtleLast: {
      boxShadow:
        'inset 2px 0px ' +
        theme.palette.primary.light +
        ', inset -2px 0px ' +
        theme.palette.primary.light +
        ', inset 0px -2px ' +
        theme.palette.primary.light,
    },
  }
})

type FieldValues = { [key: string]: boolean | string }

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
  const theme = useTheme()

  const classes = useStyles()

  const [activeDate, setActiveDate] = useState<Dayjs | undefined>(undefined)

  const filteredSubmissions = submissions.filter((s) => s.active)

  const defaultValues: FieldValues = { name: '', email: '' }

  const range = generateRange(options.length)

  range.forEach((index: number) => (defaultValues[index] = false))

  const { handleSubmit, control, reset } = useForm({ defaultValues })

  const values = useWatch({
    control,
  })

  const sums = options.map((_, index) =>
    filteredSubmissions
      .map((s) => s.options[index])
      .reduce((x: number, y: number) => x + y, values[index] ? 1 : 0)
  )

  const sumsMax = Math.max(...sums)

  const { user } = useAuth()

  const handleAdd = ({
    name,
    email,
    ...checkboxValues
  }: {
    name: string
    email?: string
    [key: number]: boolean
  }) => {
    const newOptions: number[] = range.map((index: number) =>
      checkboxValues[index] ? 1 : 0
    )

    const newSubmission: Submission = {
      name,
      options: newOptions,
      active: true,
    }
    if (askForContactDetails && email) {
      newSubmission.email = email
    }

    db.collection('polls')
      .doc(id)
      .update({
        submissions: firebase.firestore.FieldValue.arrayUnion(newSubmission),
      })
      .then(() => {
        mutate(id)
        reset(defaultValues)
      })
  }

  const confirm = useConfirm()

  const handleConfirm = (submission: Submission) => {
    confirm({
      description: `Do you really want to deactivate ${submission.name}s submission? You cannot reverse this action. Please note that this entry will remain in the database regardless, but will not be displayed any longer.`,
    })
      .then(() => handleDeactivate(submission))
      .catch(() => undefined)
  }

  const handleDeactivate = (submission: Submission) => {
    const newSubmission: Submission = {
      ...submission,
      active: false,
    }

    const batch = db.batch()

    const ref = db.collection('polls').doc(id)

    batch.update(ref, {
      submissions: firebase.firestore.FieldValue.arrayUnion(newSubmission),
    })

    batch.update(ref, {
      submissions: firebase.firestore.FieldValue.arrayRemove(submission),
    })

    batch.commit().then(() => {
      mutate(id)
    })
  }

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
    <Paper style={{ flexGrow: 1, padding: '1.5rem' }}>
      <Grid container spacing={2}>
        <Grid item xs>
          <Typography gutterBottom variant="h4" component="h3">
            {title} {!active && '[inactive]'}
          </Typography>
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

          <Typography variant="body2" color="textSecondary">
            ID: {id}
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
            <Button color="primary">Copy public share Link</Button>
          </CopyToClipboard>
        </Grid>

        <Grid item xs>
          <TableContainer component={Paper}>
            <Table aria-label="submissions">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {options.map((option, index) => {
                    const date = dayjs(option.toDate())
                    return (
                      <TableCell
                        align="center"
                        key={'option-header-' + index}
                        style={{
                          outline:
                            activeDate && date.isSame(activeDate, 'day')
                              ? `5px solid ${theme.palette.primary.main}`
                              : 'None',
                        }}
                        className={
                          sums[index] > 0 && sums[index] === sumsMax
                            ? classes.optimalChoice
                            : ''
                        }
                      >
                        {date.format('DD.MM.YYYY')}
                        <br />
                        {date.format('HH:mm')}
                      </TableCell>
                    )
                  })}
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission, sIndex) => (
                  <TableRow key={'' + sIndex}>
                    <TableCell component="th" scope="row">
                      {submission.name}{' '}
                      {askForContactDetails &&
                        submission.email &&
                        user &&
                        (user.role === roles.Admin ||
                          user.uid === creatorID) && (
                          <Link href={'mailto:' + submission.email}>
                            {submission.email}
                          </Link>
                        )}
                    </TableCell>
                    {submission.options.map((option, index) => (
                      <TableCell
                        align="center"
                        key={'submission-' + sIndex + '-' + index}
                        className={
                          sums[index] > 0 && sums[index] === sumsMax
                            ? sIndex === filteredSubmissions.length - 1
                              ? classes.optimalChoiceSubtleLast
                              : classes.optimalChoiceSubtle
                            : ''
                        }
                      >
                        <Checkbox
                          name={submission.name + index}
                          icon={<ClearIcon />}
                          checkedIcon={<CheckIcon />}
                          checked={option === 1}
                          disabled
                          aria-disabled
                        />
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Button
                        style={{ color: theme.palette.warning.main }}
                        onClick={() => handleConfirm(submission)}
                      >
                        deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {active && (
                  <TableRow key="input">
                    <TableCell
                      component="th"
                      scope="row"
                      style={{ display: 'flex' }}
                    >
                      <Controller
                        name={'name'}
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            id="input-name"
                            label="Your Name"
                            required
                            aria-required
                            style={{ width: '8rem' }}
                            error={!!error}
                            {...field}
                          />
                        )}
                      />
                      {askForContactDetails && (
                        <Controller
                          name={'email'}
                          control={control}
                          rules={{
                            required: askForContactDetails,
                            pattern:
                              /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              id="input-email"
                              label="E-Mail address"
                              required
                              type="email"
                              aria-required
                              style={{ width: '8rem' }}
                              error={!!error}
                              {...field}
                            />
                          )}
                        />
                      )}
                    </TableCell>

                    {options.map((_, index) => (
                      <TableCell
                        align="center"
                        key={'check-' + index}
                        className={
                          sumsMax !== 0 && sums[index] === sumsMax
                            ? classes.optimalChoiceSubtle
                            : ''
                        }
                      >
                        <Controller
                          name={'' + index}
                          control={control}
                          render={({
                            field: { onChange, onBlur, value, ref },
                          }) => (
                            <Checkbox
                              icon={<ClearIcon color="error" />}
                              checkedIcon={
                                <CheckIcon
                                  style={{ color: theme.palette.success.main }}
                                />
                              }
                              title={value ? 'attending' : 'not attending'}
                              onBlur={onBlur}
                              onChange={onChange}
                              checked={!!value}
                              inputRef={ref}
                            />
                          )}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit(handleAdd, console.error)}
                      >
                        submit
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              <TableFooter>
                <TableRow key="sums">
                  <TableCell component="th" scope="row">
                    Overview
                  </TableCell>
                  {options.map((_, index) => (
                    <TableCell
                      align="center"
                      key={'sums-' + index}
                      className={
                        sumsMax !== 0 && sums[index] === sumsMax
                          ? classes.optimalChoice
                          : ''
                      }
                    >
                      {sums[index]}
                    </TableCell>
                  ))}
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <Alert severity="info">
            <AlertTitle>Privacy Notice:</AlertTitle>
            If you send a submission, your choices and your Name will be
            publicly visible on this page. You may use a pseudonym of course,
            although this may make choosing a date more difficult for the
            organizer. You can retract your submission at any point using the
            deactivate button next to your submission. Note that this will
            remove your Submission from public display, but not from the
            Database itself. If you wish to have your submission removed
            completely, you can contact{' '}
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
        </Grid>
        <Grid item>
          <CalendarView
            dates={options.map((option) => dayjs(option.toDate()))}
            setActiveDate={setActiveDate}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

export default FoodleDetailView
