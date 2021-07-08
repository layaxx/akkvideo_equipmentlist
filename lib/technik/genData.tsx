import React from 'react'
import { GridCellParams } from '@material-ui/data-grid'
import { Button } from '@material-ui/core'
import { DialogMode } from '../../pages/technik'
import Device from '../types/Device'

export default function genData(
  devices: Device[],
  setState: (newState: {
    dialogDetailsShow: boolean
    dialogDetailsActiveDevice: Device | null
    dialogDetailsMode: DialogMode
  }) => void,
  isAdmin: boolean
) {
  return {
    columns: [
      { field: 'amount', headerName: 'Amount', width: 50, type: 'number' },
      { field: 'brand', headerName: 'Brand', width: 150 },
      {
        field: 'description',
        headerName: 'Name',
        width: 200,
        disableClickEventBubbling: true,
        renderCell: (params: GridCellParams) =>
          renderButton(params, setState, isAdmin),
      },
      { field: 'location', headerName: 'Location', width: 150 },
      {
        field: 'category',
        headerName: 'Category',
        width: 150,
        valueFormatter: ({ value }: { value: string }) =>
          value.split('+++').join(','),
      },
      { field: 'status', headerName: 'Status', width: 100 },
      {
        field: 'price',
        headerName: 'Price',
        type: 'number',
        width: 90,
      },
      { field: 'id', headerName: 'ID', hide: true },
      {
        field: 'associated',
        headerName: 'associated',
        hide: true,
        type: 'number',
      },
      {
        field: 'location_prec',
        headerName: 'Location precise',
        width: 150,
        hide: true,
      },
      {
        field: 'container',
        headerName: 'Container',
        width: 150,
        hide: true,
      },
      {
        field: 'store',
        headerName: 'Store',
        width: 150,
        hide: true,
      },
      {
        field: 'buyDate',
        headerName: 'Date of Purchase',
        type: 'date',
        width: 150,
        hide: true,
      },
    ],
    rows: devices,
  }
}

const renderButton = (
  params: GridCellParams,
  setState: (newState: {
    dialogDetailsShow: boolean
    dialogDetailsActiveDevice: Device | null
    dialogDetailsMode: DialogMode
  }) => void,
  isAdmin: boolean
) => {
  return (
    <Button
      variant="text"
      color="default"
      size="medium"
      style={{ justifyContent: 'left' }}
      aria-label="open details"
      onClick={(event) => {
        event.stopPropagation()
        setState({
          dialogDetailsShow: true,
          dialogDetailsActiveDevice: params.row as Device,
          dialogDetailsMode: isAdmin ? DialogMode.Edit : DialogMode.ReadOnly,
        })
      }}
    >
      {params.value}
    </Button>
  )
}
