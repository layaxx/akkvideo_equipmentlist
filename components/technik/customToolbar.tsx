import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@material-ui/data-grid'
import React, { FC } from 'react'

const CustomToolbar: FC = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
)

export default CustomToolbar
