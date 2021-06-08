import Status from './device.status'

export default interface Device {
  amount: number
  brand: string
  buyDate: string
  category: string
  comments: string
  container: string
  description: string
  id: string
  location: string
  location_prec: string
  price: number
  status: Status
  store: string
  lastEdit: string
  associated: number
}

export const EmptyDevice: Device = {
  amount: 1,
  brand: '',
  category: '',
  comments: '',
  container: '',
  description: '',
  id: '',
  location: '',
  location_prec: '',
  price: 0,
  status: Status.NotOnLoan,
  store: '',
  lastEdit: new Date().toISOString(),
  buyDate: '',
  associated: -1,
}
