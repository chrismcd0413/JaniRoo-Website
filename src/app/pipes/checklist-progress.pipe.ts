import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checklistProgress'
})
export class ChecklistProgressPipe implements PipeTransform {

  transform(value: any[], ...args: unknown[]): unknown {
    const val = value.filter(x => x.completed === true).length / value.length;
    const returnValue = Math.round(val * 100);
    return returnValue;
  }

}
