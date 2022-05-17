import { Timestamp } from '@firebase/firestore';


export class ScheduledShift {
  constructor(
    public id: string,
    public type: string,
    public start_date: Timestamp,
    public end_date: Timestamp,
    public repeatId: string,
    public location: {
      acct: string,
      loc: number
    },
    public companyId: string,
    public cleaner: string
  ){}
}
