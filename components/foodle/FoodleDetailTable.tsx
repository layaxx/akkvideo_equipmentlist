import {
  Button,
  Checkbox,
  Link,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from '@material-ui/core'
import { IFirebaseUser } from 'components/auth'
import dayjs, { Dayjs } from 'dayjs'
import firebase from 'firebase/app'
import { db } from 'lib/app'
import roles from 'lib/auth/roles'
import Poll, { Submission } from 'lib/types/Poll'
import { useConfirm } from 'material-ui-confirm'
import React, { FC, useEffect, useState } from 'react'
import { generateRange } from 'lib/helper'
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'
import { Controller, FieldValues, useForm, useWatch } from 'react-hook-form'
import { mutate } from 'swr'

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

type Props = {
  activeDate: Dayjs | undefined
  poll: Pick<
    Poll,
    | 'submissions'
    | 'options'
    | 'askForContactDetails'
    | 'id'
    | 'creatorID'
    | 'active'
    | 'thirdOption'
  >
  user: IFirebaseUser | null
}
const FoodleDetailTable: FC<Props> = ({
  activeDate,
  poll: {
    options,
    submissions,
    askForContactDetails,
    id,
    creatorID,
    active,
    thirdOption = false,
  },
  user,
}: Props) => {
  const theme = useTheme()
  const classes = useStyles()

  const confirm = useConfirm()

  const filteredSubmissions = submissions.filter((s) => s.active)
  const defaultValues: FieldValues = { name: '', email: '' }

  const range = generateRange(options.length)
  range.forEach((index: number) => (defaultValues[index] = 0))

  const { handleSubmit, control, reset } = useForm({ defaultValues })
  const values = useWatch({
    control,
  })

  const [votesPerOption, setVotesPerOption] = useState<
    { yes: number; no: number; maybe: number }[]
  >(
    options.map(() => {
      return { yes: 0, maybe: 0, no: 0 }
    })
  )

  const [isBestChoice, setIsBestChoice] = useState(options.map(() => false))

  useEffect(() => {
    setIsBestChoice(options.map(() => false))
    const votesPerOptionInternal = options.map(() => {
      return { yes: 0, maybe: 0, no: 0 }
    })

    filteredSubmissions.forEach((submission) =>
      submission.options.forEach((submissionStatus, index) =>
        submissionStatus === 1
          ? votesPerOptionInternal[index].yes++
          : submissionStatus === 2
          ? votesPerOptionInternal[index].maybe++
          : submissionStatus === 0
          ? votesPerOptionInternal[index].no++
          : undefined
      )
    )

    Object.values(values).forEach((value: number, index: number) =>
      value === 1
        ? votesPerOptionInternal[index].yes++
        : value === 2
        ? votesPerOptionInternal[index].maybe++
        : value === 0
        ? votesPerOptionInternal[index].no++
        : undefined
    )
    const metric = votesPerOptionInternal.map(
      (input) => input.yes + 0.99 * input.maybe
    )
    const metricMax = Math.max(...metric)
    setIsBestChoice(metric.map((input) => input === metricMax))
    setVotesPerOption(votesPerOptionInternal)
  }, [values])

  const handleAdd = ({
    name,
    email,
    ...checkboxValues
  }: {
    name: string
    email?: string
    [key: number]: number
  }) => {
    const newOptions: number[] = range.map(
      (index: number) => checkboxValues[index]
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

  return (
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
                    boxShadow:
                      activeDate && date.isSame(activeDate, 'day')
                        ? '10px 10px 34px -20px rgba(0,0,0,0.75)'
                        : undefined,
                  }}
                  className={isBestChoice[index] ? classes.optimalChoice : ''}
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
                  (user.role === roles.Admin || user.uid === creatorID) && (
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
                    isBestChoice[index]
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
                    title={
                      option === 1
                        ? 'attending'
                        : option === 2
                        ? 'attending if necessary'
                        : 'not attending'
                    }
                    indeterminate={option === 2}
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
              <TableCell component="th" scope="row" style={{ display: 'flex' }}>
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
                    isBestChoice[index] ? classes.optimalChoiceSubtle : ''
                  }
                >
                  <Controller
                    name={'' + index}
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <Checkbox
                        icon={<ClearIcon color="error" />}
                        checkedIcon={
                          <CheckIcon
                            style={{ color: theme.palette.success.main }}
                          />
                        }
                        title={
                          value === 1
                            ? 'attending'
                            : value === 2
                            ? 'attending if necessary'
                            : 'not attending'
                        }
                        indeterminate={value === 2}
                        onBlur={onBlur}
                        onChange={() => {
                          onChange((value + 1) % (thirdOption ? 3 : 2))
                        }}
                        checked={value === 1}
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
                className={isBestChoice[index] ? classes.optimalChoice : ''}
              >
                {votesPerOption[index].yes}
                {votesPerOption[index].maybe > 0 &&
                  ` (+${votesPerOption[index].maybe})`}
              </TableCell>
            ))}
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default FoodleDetailTable
