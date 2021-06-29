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
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void
  options: IOptions
}

export interface IDetailsDialogProps {
  devices: Device[]
  activeDevice: Device | null
  mode: any
  show: boolean
  updateState: Function
  options: any
  handleClose: any
}

export type IOptionsLookup = IOptions & {
  brand: string[]
  category: string[]
  status?: string[]
}
