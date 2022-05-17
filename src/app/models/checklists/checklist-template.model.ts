import { TemplateChecklistTask } from "./task.model";

export class TemplateChecklist {
  constructor(
    public id: string,
    public companyId: string,
    public tasks: TemplateChecklistTask[],
    public title: string,
    public type: string,
    public location: {
      acct: string,
      loc: number
    },
    public tzId: string,
    public active: boolean,
    public weekdays?: number[]
  ){}
}
