import React from 'react'
import { Grid, makeStyles, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useRouter } from 'next/dist/client/router'
import { NextPage } from 'next'
import LandingPageOverviewItem from 'components/landingpage/OverviewItem'
import roles from 'lib/auth/roles'
import { useAuth } from 'components/auth'
import Link from 'next/link'

const useStyles = makeStyles({
  root: {
    '& .MuiGrid-item': {
      display: 'flex',
      '& .MuiPaper-root': {
        /* All Elements (at least those in the same row) should have the same height */
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
    },
  },
})

export type PageDescription = {
  link: string
  description: string
  title: string
  requirements?: roles[] | null
  /* Requirements are interpreted as follows:
    null => user doesn't event need to be logged in to have (some kind of) access 
    [] / empty Array => user needs to be logged in but role doesn't matter
    [role1, role2] => user needs to be logged in and have either role1 or role2 assigned 
    */
}

const MainPage: NextPage = () => {
  const router = useRouter()

  const { user } = useAuth()
  const classes = useStyles()

  const items: PageDescription[] = [
    {
      link: '/technik',
      title: 'Technikverwaltung',
      description:
        'Overview over registered Devices.<br />Add or edit devices (Admin only).',
      requirements: [roles.Member, roles.Moderator, roles.Admin],
    },
    {
      link: '/admin',
      title: 'Nutzerverwaltung',
      description:
        'Overview over registered Users.<br />Delete accounts and change access rights.',
      requirements: [roles.Admin],
    },
    {
      link: '/foodle',
      title: 'Terminmanagement',
      description:
        'Self-developed Doodle alternative. <br /> No Advertisements. No Cookies (unless you are logged in). No Tracking.',
      requirements: null,
    },
    {
      link: '/account',
      title: 'Your Account',
      description:
        'Overview over your account details.<br />Delete your account, verify your e-Mail address.',
      requirements: [],
    },
  ]

  return (
    <>
      <Typography component="h1" variant="h3" gutterBottom>
        Arbeitskreis Video
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Internal administration platform
      </Typography>
      {router.query.msg ? (
        <Alert severity="error">An error occurred: {router.query.msg}</Alert>
      ) : null}

      {!user && (
        <Typography variant="body1" gutterBottom>
          You are currently not logged in. This means you only have access to{' '}
          <Link href="/foodle">Foodle Polls</Link> for which you have received a
          direct share link.
        </Typography>
      )}

      <Grid
        container
        spacing={3}
        justify="space-evenly"
        className={classes.root}
      >
        {items
          .filter((item) => {
            const accessForEveryone = item.requirements === null
            if (accessForEveryone) return true
            const accessForEveryLoggedInUser =
              !item.requirements || item.requirements.length === 0
            if (accessForEveryLoggedInUser) return !!user
            const accessForSpecificRoles =
              user &&
              user.role &&
              item.requirements &&
              item.requirements.indexOf(user.role) !== -1
            return accessForSpecificRoles
          })
          .map((item, index) => (
            <Grid item xs={12} sm={6} key={'' + index}>
              <LandingPageOverviewItem {...item} />
            </Grid>
          ))}
      </Grid>
    </>
  )
}

export default MainPage
