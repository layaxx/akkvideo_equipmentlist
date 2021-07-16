import { IOptions } from 'lib/types/device.dialog'
import Device from 'lib/types/Device'

interface ICompleteOptions extends IOptions {
  brand: string[]
  category: string[]
}

export default function genOptions(devices: Device[]): ICompleteOptions {
  return {
    location: [
      ...new Set(
        devices
          .map((device: Device) => device.location)
          .filter((value: string) => value !== '')
      ),
    ],
    location_prec: [
      ...new Set(
        devices
          .map((device: Device) => device.location_prec)
          .filter((value: string) => value !== '')
      ),
    ],
    container: [
      ...new Set(
        devices
          .map((device: Device) => device.container)
          .filter((value: string) => value !== '')
      ),
    ],
    brand: [
      ...new Set(
        devices
          .map((device: Device) => device.brand)
          .filter((value: string) => value !== '')
      ),
    ],
    category: [
      ...new Set(
        devices
          .map((device: Device) => device.category)
          .map((val) => val.split('+++'))
          .flat()
          .filter((value: string) => value !== '')
      ),
    ],
  }
}
