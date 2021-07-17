import { ICompleteOptions } from 'lib/technik/genOptions'
import { DialogMode } from 'pages/technik'
import { UseControllerProps } from 'react-hook-form'
import Device from './Device'

export interface IOptions {
  location: string[]
  location_prec: string[]
  container: string[]
}

export type IControllerProps = UseControllerProps<
  { category: string; value: string },
  'value' | 'category'
>

export interface IBulkEditDialogProps {
  devices: Device[]
  show: boolean
  handleClose: () => void
  options: IOptions
}

export interface IDetailsDialogProps {
  devices: Device[]
  activeDevice: Device | null
  mode: DialogMode
  show: boolean
  options: ICompleteOptions
  handleClose: () => void
}

export type IOptionsLookup = IOptions & {
  brand: string[]
  category: string[]
  status?: string[]
}
