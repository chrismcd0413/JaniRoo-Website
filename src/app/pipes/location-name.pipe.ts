import { Pipe, PipeTransform } from '@angular/core';
import { UserInfo } from '../Shared Services/user-info.service';

@Pipe({
  name: 'locationName'
})
export class LocationNamePipe implements PipeTransform {
  constructor(
    private userInfo: UserInfo
  ){}
  transform(value: any, accounts: any[], isString: boolean): unknown {
    if (!accounts){
      return null;
    }
    let location;
    if (isString) {
      location = JSON.parse(value);
    } else {
      location = value;
    }
    // console.log('VALUE: ', value);
    const acct = accounts.find(x => x.id === location.acct);
    const loc = acct.locations.find(x => x.id === location.loc);
    const formattedString = acct.name + ' - ' + loc.name;
    return formattedString;
  }

}
