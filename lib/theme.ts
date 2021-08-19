import red from '@material-ui/core/colors/red'
import createTheme from '@material-ui/core/styles/createTheme'

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#fb8c00',
    },
    secondary: {
      main: '#212529',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
    grey: {
      A700: '#212529',
    },
    warning: {
      main: '#ff0000',
    },
  },
})

export default theme
