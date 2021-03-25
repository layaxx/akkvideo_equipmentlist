import {
  GridColumnsToolbarButton,
  GridFilterToolbarButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@material-ui/data-grid'
import React from 'react'

export default function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridColumnsToolbarButton />
      <GridFilterToolbarButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  )
}
