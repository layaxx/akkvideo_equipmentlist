export default interface Device {
  brand: string
  category: string
  comments: string
  container: string
  description: string
  id: string
  location: string
  location_prec: string
  price: string
  status: string
  store: string
  lastEdit: string
  buyDate: string
}

export const EmptyDevice: Device = {
  brand: '',
  category: '',
  comments: '',
  container: '',
  description: '',
  id: '',
  location: '',
  location_prec: '',
  price: '',
  status: '',
  store: '',
  lastEdit: new Date().toISOString(),
  buyDate: '',
}
