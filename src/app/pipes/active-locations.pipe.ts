import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeLocations'
})
export class ActiveLocationsPipe implements PipeTransform {

  transform(locations: any[] ): any {
    return locations.filter(x => x.active === true);
  }

}
