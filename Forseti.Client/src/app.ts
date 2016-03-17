import {Router, RouterConfiguration} from 'aurelia-router'

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Forseti';
    config.map([
      { route: ['', 'home'], name: 'home', moduleId: 'home', nav: true, title: 'home' },
      { route: 'devices', name: 'devices', moduleId: 'devices', nav: true, title: 'List of devices' },
      { route: 'checkin',  name: 'checkin', moduleId: 'devices', nav: true, title: 'Checkin' },
      { route: 'checkin',  name: 'checkout', moduleId: 'devices', nav: true, title: 'Checkout' }
    ]);

    this.router = router;
  }
}
