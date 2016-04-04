import {autoinject} from 'aurelia-framework';
import * as Hammer from 'hammerjs';
import * as rx from 'rx';

@autoinject
export class OffCanvasLayout{
  container;
  frames;
  onPanInitValues;

  constructor(private element: Element){
  }

  attached(){
    this.container = this.element.querySelector('.off-canvas-layout-container');
    this.frames = this.element.querySelectorAll('.off-canvas-content');

    this.initializeContent();

    var source = this.watchPan();
    source.subscribe(
      this.onPan.bind(this),
      (err) => { console.log('err:', err);},
      () => { console.log('completed');}
    );
  }

  private initializeContent(){
    let indexOfFrameInView = this.getIndexOfFrameInView();


    this.foreachFrame((frame, i) => {
      let framesFromView = i - indexOfFrameInView;
      let translateX = 100 * framesFromView;
      frame.style.transform = `translateX(${translateX}%)`;
    });
  }

  private foreachFrame(action){
      for (let i = 0, max = this.frames.length; i < max; i++){
        action.call(this, this.frames[i], i, this.frames);
      }
  }

  private onPan(event){
    let deltaX = 100*event.deltaX / window.innerWidth;
    if (!this.onPanInitValues){
      this.onPanInitValues = this.getInitialValues();
    }

    this.foreachFrame((frame, i) => {
      let framesFromView = i - this.onPanInitValues.indexOfFrameInView;
      let translateX = (100 * framesFromView) + deltaX;
      frame.style.transform = `translateX(${translateX}%)`;
    });

    if (event.isFinal){
      this.onPanInitValues = undefined;
    }
  }

  private getInitialValues(){
    return {
      indexOfFrameInView: this.getIndexOfFrameInView()
    };
  }

  private getIndexOfFrameInView(){
    let indexOfFrameInView = 0;
    this.foreachFrame((frame, i) => {
      if (frame.classList.contains('js-in-view')){
        indexOfFrameInView = i;
      }
    });
    return indexOfFrameInView;
  }

  private watchPan(){
    let recognizer = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10});
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
