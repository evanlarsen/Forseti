//import {computedFrom} from 'aurelia-framework';

export class Home {
  
}

export class UpperValueConverter {
  toView(value) {
    return value && value.toUpperCase();
  }
}
