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
  updateState: any
}) {
  const { options, label, activeDevice, updateState } = props

  return (
    <Autocomplete
      multiple
      value={activeDevice?.[label]
        .split('+++')
        .filter((val: string) => val !== '')}
      onChange={(_, newValue: any) => {
        updateState(() => {
          return {
            dialogActiveDevice: {
              ...activeDevice,
              [label]: newValue
                .map((val: { inputValue: any; title: any }) =>
                  typeof val === 'string'
                    ? val
                    : !!val.inputValue
                    ? val.inputValue
                    : val.title
                )
                .sort((a: string, b: string) => a.localeCompare(b))
                .join('+++'),
            },
          }
        })
      }}
      filterOptions={(options, params) => {
        const filtered = createFilterOptions<OptionsType>()(options, params)

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
