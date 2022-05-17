export class Location {
  constructor(
    public active: boolean,
    public id: {
      acct: string,
      loc: string
    },
    public name: string,
    public address: {
      formatted_address: string,
      address2: string,
      geo: {
        lat: number,
        lng: number
      },
      tzId: string,
      notes: string
    },
    public geo_enabled: boolean,
    public geo_radius: number
  ){}

}
