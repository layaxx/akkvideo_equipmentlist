import { MenuItem, Select } from '@material-ui/core'
import React from 'react'
import { UseControllerProps, useController } from 'react-hook-form'

export default function BulkEditCategoryInput(
  props: UseControllerProps<
    { category: string; value: string },
    'value' | 'category'
  >
) {
  const { field } = useController(props)

  return (
    <Select {...field} placeholder={props.name}>
      <MenuItem value="location">Location</MenuItem>
      <MenuItem value="location_prec">Location Precise</MenuItem>
      <MenuItem value="container">Container</MenuItem>
      <MenuItem value="associated">Associated</MenuItem>
    </Select>
  )
}
