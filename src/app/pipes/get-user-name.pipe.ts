import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getUserName'
})
export class GetUserNamePipe implements PipeTransform {

  transform(value: any, users: any[]): unknown {
    if (!users || !value){
      return null;
    }
    return users.find(x => x.id === value).name;
  }

}
