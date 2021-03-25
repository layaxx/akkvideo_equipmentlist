import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '../auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import NavBar from '../components/navbar'
import Footer from '../components/footer'
import React from 'react'
import '../styles/global.css'
import 'rsuite-table/dist/css/rsuite-table.min.css'
import { SnackbarProvider } from 'notistack'
import theme from '../lib/theme'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

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
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <div className="wrapper d-flex flex-column">
            <NavBar />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              style={{ marginBottom: '3rem' }}
            >
              <main className="flex-fill main">
                <Component {...pageProps} />
              </main>
            </SnackbarProvider>
            <Footer />
          </div>
        </ThemeProvider>
      </React.Fragment>
    </AuthProvider>
  )
}
export default MyApp
