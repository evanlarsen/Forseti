import {Router, RouterConfiguration} from 'aurelia-router';
import {autoinject} from 'aurelia-framework';
import * as Hammer from 'hammerjs';
import * as rx from 'rx';

@autoinject
export class App {
  router: Router;

  constructor(private element: Element){
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Forseti';
    config.map([
      { route: ['', 'home'], name: 'home', moduleId: 'home', nav: true, title: 'home' },
      { route: 'devices', name: 'devices', moduleId: 'devices', nav: true, title: 'devices' },
      { route: 'checkin',  name: 'checkin', moduleId: 'checkin', nav: true, title: 'check in' },
      { route: 'checkout',  name: 'checkout', moduleId: 'checkout', nav: true, title: 'check out' }
    ]);

    this.router = router;
  }

  attached(){
    var source = this.watchPan();
    source.subscribe(
      (x) => { console.log(x);},
      (err) => { console.log('err:', err);},
      () => { console.log('completed');}
    );
  }

  watchPan(){
    var recognizer = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10});
    let hammer = new Hammer(<HTMLElement>this.element, {});
    hammer.add(recognizer);
    return rx.Observable.create(observer => {
      hammer.on('pan', ev => {
        observer.onNext(ev);
      });

      return () => { hammer.off('off'); };
    });
  }
}
