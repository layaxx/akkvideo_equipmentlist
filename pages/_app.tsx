import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '../auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import NavBar from '../components/navbar'
import Footer from '../components/footer'
import React from 'react'
import '../styles/global.css'
import { SnackbarProvider } from 'notistack'
import theme from '../lib/theme'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import ProgressBar from '@badrap/bar-of-progress'
import Router from 'next/router'
import { ConfirmProvider } from 'material-ui-confirm'

const progress = new ProgressBar({
  size: 5,
  color: theme.palette.primary.main,
  className: 'bar-of-progress',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles)
    }
  }, [])

  return (
    <AuthProvider>
      <React.Fragment>
        <Head>
          <title>AK Video intern</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="wrapper d-flex flex-column">
            <NavBar />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <ConfirmProvider>
                <main className="flex-fill main">
                  <Component {...pageProps} />
                </main>
              </ConfirmProvider>
            </SnackbarProvider>
            <Footer />
          </div>
        </ThemeProvider>
      </React.Fragment>
    </AuthProvider>
  )
}
export default MyApp
