import {bindable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject} from 'aurelia-dependency-injection';

@autoinject
export class MasterNavigation{
    @bindable router;
    isCheckIn: boolean;
    isDevices: boolean;
    isCheckOut: boolean;

    constructor(private eventAggregator: EventAggregator){
      this.eventAggregator.subscribe(
        'router:navigation:success',
        this.navigationSuccess.bind(this)
      );
      this.resetNavFlags();
    }

    attached(){ console.log('master navigation attached');}

    resetNavFlags(){
      this.isCheckIn = false;
      this.isDevices = false;
      this.isCheckOut = false;
    }

    navigationSuccess(event){
      this.resetNavFlags();
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
