import { UserPermissions } from "./user-permission.model"

export class User {
  constructor(
    public id: string,
    public companyId: string,
    public email: string,
    public name: string,
    public phone_number: number,
    public role: string,
    public active: boolean,
    public address: {
      address1: string,
      address2: string,
      city: string,
      state: string,
      zip: number
    },
    public locations: UserPermissions[]
  ){}

}
