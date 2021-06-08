import { UseControllerProps } from 'react-hook-form'
import Device from '../../../../lib/types/Device'

export interface IOptions {
  location: string[]
  location_prec: string[]
  container: string[]
}

export type IControllerProps = UseControllerProps<
  { category: string; value: string },
  'value' | 'category'
>

export type IBulkEditDialogProps = {
  devices: Device[]
  show: boolean
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void
  options: IOptions
}
