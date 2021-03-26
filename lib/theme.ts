import { createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'

// Create a theme instance.
const theme = createMuiTheme({
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
  },
})

export default theme
