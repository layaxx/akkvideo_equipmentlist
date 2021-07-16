import { TextField } from '@material-ui/core'
import {
  Autocomplete,
  createFilterOptions,
  FilterOptionsState,
} from '@material-ui/lab'
import React, { ReactElement } from 'react'
import { IOptionsLookup } from 'lib/types/device.dialog'
import { OptionsType } from 'lib/types/device.options'

type Props = {
  required?: boolean
  multiSelect?: boolean
  readOnly: boolean
  value: string | null | undefined
  onChange: (...event: any[]) => void
  options: IOptionsLookup
  attr: keyof IOptionsLookup
}

export default function CustomSelect({
  multiSelect,
  required,
  readOnly,
  value,
  onChange,
  options,
  attr,
}: Props): ReactElement {
  const handleChangeSingle = (_: unknown, newValue: any) => {
    if (typeof newValue === 'string') {
      onChange(newValue)
    } else if (newValue && newValue.inputValue) {
      // Create a new value from the user input
      onChange(newValue.inputValue)
    } else {
      onChange(newValue?.title || '')
    }
  }

  const handleChangeMulti = (_: unknown, newValue: any) => {
    onChange(
      newValue
        .map((val: { inputValue: unknown; title: any }) => {
          if (typeof val === 'string') {
            return val
          } else if (val.inputValue) {
            return val.inputValue
          }
          return val.title
        })
        .sort((a: string, b: string) => a.localeCompare(b))
        .join('+++')
    )
  }
  return (
    <Autocomplete
      multiple={multiSelect}
      disabled={readOnly}
      value={
        multiSelect
          ? value?.split('+++').filter((val: string) => val !== '') ?? ''
          : value ?? ''
      }
      onChange={multiSelect ? handleChangeMulti : handleChangeSingle}
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
    />
  )
}
