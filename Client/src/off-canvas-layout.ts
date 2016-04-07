import {autoinject} from 'aurelia-framework';
import * as Hammer from 'hammerjs';
import * as rx from 'rx';

let activeFrameTag = 'js-in-view';
let animationDuration = 500;

@autoinject
export class OffCanvasLayout{
  private world: World;
  private inputState: InputState;

  constructor(private element: Element){
    this.world = new World();
    this.inputState = new InputState();
  }

  attached(){
    this.initializeContent();

    var source = this.watchPan();

    source
      .map(e => {
        return { deltaX: e.deltaX, isFirst: e.isFirst, isFinal: e.isFinal };
      })
      .subscribe(
        this.onPan.bind(this),
        (err) => { console.log('err:', err);},
        () => { console.log('completed');}
      );
  }

  private initializeContent(){
    let frames = this.element.querySelectorAll('.off-canvas-content');

    for(let i = 0, max = frames.length; i < max; i++){
      let frame = new Frame(<HTMLElement>frames[i], i)
      this.world.frames.push(frame);
    }

    this.world.resetFramesPositions();
    this.world.draw();
  }

  private onPan(event : HammerInput){
    this.inputState.deltaX = 100*event.deltaX / window.innerWidth;
    this.inputState.isUserDoneSwipping = false;

    if (!this.inputState.isUserSwipping){
      window.requestAnimationFrame(this.panAnimationLoop);
      this.inputState.isUserSwipping = true;
    }

    if (event.isFinal){
      this.inputState.isUserSwipping = false;
      this.inputState.isUserDoneSwipping = true;
    }
  }

  private panAnimationLoop = this._panAnimationLoop.bind(this);
  private _panAnimationLoop(timestamp?: number){
    this.world.slideWorld(this.inputState.deltaX);
    this.world.draw();

    if (this.inputState.isUserDoneSwipping){
      console.log('moving to auto slide');
      window.requestAnimationFrame(this.slideToNewViewAnimationLoop);
      return;
    }
    window.requestAnimationFrame(this.panAnimationLoop);
  }

  startTimestamp: number;
  private slideToNewViewAnimationLoop = this._slideToNewViewAnimationLoop.bind(this);
  private _slideToNewViewAnimationLoop(timestamp?:number){
    if (!this.startTimestamp){
      this.startTimestamp = timestamp;
    }
    let timeDelta = timestamp - this.startTimestamp;
    let timeRange = timeDelta / animationDuration;
    let direction: number;
    if (this.inputState.isSlidingRight && this.world.canSlideRight){
      direction = 1;
    } else if (this.inputState.isSlidingLeft && this.world.canSlideLeft){
      direction = -1;
    } else if ((this.inputState.isSlidingRight && !this.world.canSlideRight)
      || (this.inputState.isSlidingLeft && !this.world.canSlideLeft))
    {
      direction = 0;
    } else {
      throw 'Not sure what happened here but couldnt determine which direction to slide';
    }
    let distanceRange = (100 * direction) - this.inputState.deltaX;
    let deltaX = this.inputState.deltaX + (distanceRange * timeRange);

    if (direction === -1) {
        deltaX = Math.max(deltaX, -100)
    }else if (direction === 0){
      if (this.inputState.isSlidingLeft){
        deltaX = Math.min(deltaX, 0)
      }else {
        deltaX = Math.max(deltaX, 0);
      }
    }else if (direction === 1){
      deltaX = Math.min(deltaX, 100);
    }

    this.world.slideWorld(deltaX);
    this.world.draw();

    if ((direction === 0 && this.inputState.isSlidingLeft && deltaX >= 0)
      || (direction === 0 && this.inputState.isSlidingRight && deltaX <= 0)
      || ((direction === -1 || direction === 1) && (deltaX >= 100 || deltaX <= -100))){
      console.log('delta greater than or less than 100');
      this.startTimestamp = undefined;
      this.world.setNewActiveView(direction);
      return;
    }
    console.log('.');
    window.requestAnimationFrame(this.slideToNewViewAnimationLoop);
  }

  private watchPan() : rx.Observable<HammerInput>{
    let recognizer = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10});
    let hammer = new Hammer(<HTMLElement>this.element, {});
    hammer.add(recognizer);
    return rx.Observable.create<HammerInput>(observer => {
      hammer.on('pan', ev => {
        observer.onNext(ev);
      });

      return () => { hammer.off('off'); };
    });
  }
}

class InputState{
  isUserSwipping: boolean;
  deltaX: number;
  isUserDoneSwipping: boolean;

  get isSlidingRight(): boolean{
    return this.deltaX > 0;
  }

  get isSlidingLeft(): boolean{
    return this.deltaX < 0;
  }
}

class World{
  public static slideThreshold = 50;
  public frames: Frame[];
  constructor(){
    this.frames = [];
  }

  public resetFramesPositions(){
    let activeIndex = this.getIndexOfActiveFrame();
    this.foreachFrame((frame, i) => {
      frame.xCoordinate = (activeIndex - i) * 100;
    });
  }

  public draw(){
    this.foreachFrame((frame, i) => {
      frame.draw();
    });
  }

  public slideWorld(deltaX: number){
    this.foreachFrame((frame, i) => {
      let framesFromView = i - this.getIndexOfActiveFrame();
      frame.xCoordinate = (100 * framesFromView) + deltaX;
    });
  }

  get canSlideRight(): boolean{
    return !this.frames[0].isActive;
  }

  get canSlideLeft(): boolean{
    return !this.frames[this.frames.length - 1].isActive;
  }

  public setNewActiveView(direction: number){
    let activeIndex = this.getIndexOfActiveFrame();
    let newIndex = activeIndex - direction;
    if (newIndex < 0 || newIndex >= this.frames.length){
      throw "new active index of frames is out of bounds";
    }
    this.foreachFrame((frame, i) => {
      frame.isActive = !!(i === newIndex);
    });
  }

  private getIndexOfActiveFrame(){
    for(let i = 0, max = this.frames.length; i < max; i++){
      if (this.frames[i].htmlElement.classList.contains(activeFrameTag)){
        return i;
      }
    }
    throw `There are no frames marked with the css class '${activeFrameTag}'`
     + ' which marks the div on the canvas. All other divs will be'
     + ' rendered off canvas.';
  }

  private foreachFrame(action: (frame: Frame, i: number) => void){
    for(let i = 0, max = this.frames.length; i < max; i++){
      action.call(this, this.frames[i], i);
    }
  }
}

class Frame{
  public xCoordinate: number;

  constructor(
    public htmlElement: HTMLElement,
    public index: number)
  {}

  get isActive(){
    return this.htmlElement.classList.contains(activeFrameTag);
  }

  set isActive(isActive: boolean){
    if (isActive){
      this.htmlElement.classList.add(activeFrameTag);
    } else {
      this.htmlElement.classList.remove(activeFrameTag);
    }
  }

  draw(){
    this.htmlElement.style.transform = `translateX(${this.xCoordinate}%)`;
  }
}
