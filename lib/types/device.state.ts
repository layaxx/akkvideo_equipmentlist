import { GridRowId } from '@material-ui/data-grid'
import { DialogMode } from 'pages/technik'
import Device from './Device'

export interface DeviceState {
  dialogDetailsShow: boolean
  dialogDetailsActiveDevice: Device | null
  dialogDetailsMode: DialogMode
  dialogLendingShow: boolean
  dialogBulkEditShow: boolean
  selectionModel: GridRowId[]
  showMenu: boolean
  pdfb64: string
}
