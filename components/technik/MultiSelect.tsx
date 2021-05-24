import { TextField } from '@material-ui/core'
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete/Autocomplete'
import React from 'react'
import Device from '../../lib/types/Device'

interface OptionsType {
  inputValue?: string
  title: string
}

export default function MultiSelect(props: {
  options: any
  label: 'category' | 'location'
  activeDevice: Device | null
  updateState: Function
  readOnly: boolean
}) {
  const { options, label, activeDevice, updateState, readOnly } = props

  return (
    <Autocomplete
      disabled={readOnly}
      multiple
      value={activeDevice?.[label]
        .split('+++')
        .filter((val: string) => val !== '')}
      onChange={(_, newValue: any) => {
        updateState(() => {
          return {
            dialogDetailsActiveDevice: {
              ...activeDevice,
              [label]: newValue
                .map((val: { inputValue: any; title: any }) => {
                  if (typeof val === 'string') {
                    return val
                  } else if (!!val.inputValue) {
                    return val.inputValue
                  }
                  return val.title
                })
                .sort((a: string, b: string) => a.localeCompare(b))
                .join('+++'),
            },
          }
        })
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
