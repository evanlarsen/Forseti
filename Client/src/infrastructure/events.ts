import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {autoinject} from 'aurelia-framework';

export interface IEvents{
  publish(event: any, data?: any): void;
  subscribe(event: string | Function, callback: Function): Subscription;
}

@autoinject
export class Events implements IEvents{
  constructor(private eventAggregator: EventAggregator){
  }

  public publish(event: any, data?: any){
    this.eventAggregator.publish(event, data);
  }

  public subscribe(event: string | Function, callback: Function): Subscription{
    return this.eventAggregator.subscribe(event, callback);
  }
}
