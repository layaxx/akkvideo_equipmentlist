import { TextField } from '@material-ui/core'
import {
  Autocomplete,
  createFilterOptions,
  FilterOptionsState,
} from '@material-ui/lab'
import React from 'react'
import { IOptionsLookup } from '../../../../lib/types/device.dialog.types'
import { OptionsType } from '../../SingleSelect'

export default function CustomSelect({
  required,
  readOnly,
  value,
  onChange,
  options,
  attr,
}: {
  required?: boolean
  readOnly: boolean
  value: string | null | undefined
  onChange: Function
  options: IOptionsLookup
  attr: keyof IOptionsLookup
}) {
  return (
    <Autocomplete
      disabled={readOnly}
      value={value ?? ''}
      onChange={(_, newValue: any) => {
        if (typeof newValue === 'string') {
          onChange(newValue)
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          onChange(newValue.inputValue)
        } else {
          onChange(newValue?.title || '')
        }
      }}
      filterOptions={(
        options: OptionsType[],
        state: FilterOptionsState<OptionsType>
      ) => {
        const filtered = createFilterOptions<OptionsType>()(options, state)
        if (state.inputValue !== '') {
          filtered.push({
            inputValue: state.inputValue,
            title: `Add ${attr} "${state.inputValue}"`,
          })
        }
        return filtered
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id={attr}
      options={
        options[attr]?.map((str: string) => ({
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
      renderOption={(option) => option.title}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={required ? attr + ' *' : attr} />
      )}
      style={{ width: 200 }}
    />
  )
}
