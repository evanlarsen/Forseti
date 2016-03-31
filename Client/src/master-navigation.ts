import {bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject} from 'aurelia-dependency-injection';

@autoinject
export class MasterNavigation{
    @bindable router;
    isCheckIn = false;
    isDevices = false;
    isCheckOut = false;

    constructor(private eventAggregator: EventAggregator){
      this.eventAggregator.subscribe(
        'router:navigation:success',
        this.navigationSuccess.bind(this)
      );
    }

    navigationSuccess(event){
      this.isCheckIn = false;
      this.isDevices = false;
      this.isCheckOut = false;
      let moduleName = event.instruction.config.name;
      if (moduleName == 'devices'){
        this.isDevices = true;
      } else if (moduleName == 'checkin'){
        this.isCheckIn = true;
      } else if (moduleName == 'checkout'){
        this.isCheckOut = true;
      }
    }
}
