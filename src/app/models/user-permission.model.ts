
export class UserPermissions {
  constructor(
    public id: string,
    public location: {
      acct: string,
      loc: string
    },
    public inspection: boolean,
    public inventory: boolean,
    public pay_rate: number,
    public pay_frequency: string,
    public active: boolean
  ){}

}
