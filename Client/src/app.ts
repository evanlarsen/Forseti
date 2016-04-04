import {Router, RouterConfiguration} from 'aurelia-router';

export class App {
  router: Router;

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
}
