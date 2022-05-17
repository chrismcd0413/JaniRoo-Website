import { Timestamp } from '@firebase/firestore';

export class TemplateChecklistTask {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public photo_required: boolean,
    public sub_tasks: string[]
  ){}
}
