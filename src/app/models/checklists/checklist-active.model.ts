import { Timestamp } from '@firebase/firestore';

export class ActiveChecklist {
  constructor(
    public companyId: string,
    public location: {
      acct: string,
      loc: number
    },
    public tasks: Object[],
    public expiration: Timestamp,
    public date_range: string,
    public templateId: string,
    public title: string,
    public complete: boolean,
    public id?: string,
    public user?: string,
  ){}
}
