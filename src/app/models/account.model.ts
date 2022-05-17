import { Location } from "./location.model"

export class Account {
  constructor(
    public companyId: string,
    public id: string,
    public name: string,
    public details: {
      address: {
        address1: string,
        address2: string,
        city: string,
        state: string,
        zip: number,
        formatted_address: string,
      },
      email: string,
      name: string,
      notes: string,
      phone: number,
    },
    public locations: Location[]
  ){}

}
