import { TextField } from '@material-ui/core'
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete/Autocomplete'
import React from 'react'

interface OptionsType {
  inputValue?: string
  title: string
}

export default function SingleSelect(props: {
  options: any
  label: any
  activeDevice: any
  updateState: any
  readOnly: boolean
}) {
  const { options, label, activeDevice, updateState, readOnly } = props

  return (
    <Autocomplete
      disabled={readOnly}
      value={activeDevice?.[label]}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          updateState(() => {
            return {
              dialogActiveDevice: {
                ...activeDevice,
                [label]: newValue,
              },
            }
          })
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          updateState(() => {
            return {
              dialogActiveDevice: {
                ...activeDevice,
                [label]: newValue.inputValue,
              },
            }
          })
        } else {
          updateState(() => {
            return {
              dialogActiveDevice: {
                ...activeDevice,
                [label]: newValue?.title || '',
              },
            }
          })
        }
      }}
      filterOptions={(optionsParam, params) => {
        const filtered = createFilterOptions<OptionsType>()(
          optionsParam,
          params
        )

        // Suggest the creation of a new value
        if (params.inputValue !== '') {
          filtered.push({
            inputValue: params.inputValue,
            title: `Add ${label} "${params.inputValue}"`,
          })
        }

        return filtered
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id={`input-${label}`}
      options={options}
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
      renderInput={(params) => <TextField {...params} label={label} />}
      style={{ width: 200 }}
    />
  )
}
