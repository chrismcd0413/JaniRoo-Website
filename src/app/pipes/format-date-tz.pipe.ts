import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@firebase/firestore';
import * as moment from 'moment-timezone';
@Pipe({
  name: 'formatDateTZ'
})
export class FormatDateTZPipe implements PipeTransform {

  transform(value: Timestamp, accounts: any, location: any, format: string): unknown {
    if (!accounts || !location || !format || !value){
      return null;
    }
    const tzId = accounts.find(x => x.id === location.acct).locations.find(x => x.id === location.loc).address.tzId;
    const m = moment.tz(value.toMillis(), tzId);
    return m.format(format);
  }

}
