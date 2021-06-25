import { TextField } from '@material-ui/core'
import {
  FilterOptionsState,
  createFilterOptions,
  Autocomplete,
} from '@material-ui/lab'
import React from 'react'
import { useController, useWatch } from 'react-hook-form'
import { IControllerProps, IOptions } from '../../../../lib/types/device.dialog'
import { OptionsType } from '../../../../lib/types/device.options'

export default function BulkEditValueInput(
  props: IControllerProps & { options: IOptions }
) {
  const { field } = useController(props)
  const category = useWatch({
    control: props.control,
    name: 'category',
  })

  return (
    <Autocomplete
      {...field}
      filterOptions={(
        options: OptionsType[],
        state: FilterOptionsState<OptionsType>
      ) => {
        const filtered = createFilterOptions<OptionsType>()(options, state)
        if (state.inputValue !== '') {
          filtered.push({
            inputValue: state.inputValue,
            title: `Add ${category} "${state.inputValue}"`,
          })
        }
        return filtered
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="input-bulk-edit-value"
      options={
        props.options[category as keyof IOptions]?.map((str: string) => ({
          inputValue: '',
          title: str,
        })) || []
      }
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue
        }
        // Regular option
        return option.title
      }}
      onChange={(_, newValue: any) => {
        if (typeof newValue === 'string') {
          field.onChange(newValue)
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          field.onChange(newValue.inputValue)
        } else {
          field.onChange(newValue?.title || '')
        }
      }}
      renderOption={(option) => option.title}
      freeSolo
      renderInput={(params) => {
        return <TextField {...params} label={category} />
      }}
      style={{ width: 200 }}
    />
  )
}
