import {autoinject} from 'aurelia-framework';
import * as Hammer from 'hammerjs';
import * as rx from 'rx';
import {InputState} from './input-state';
import {Settings} from './settings';
import {Stage} from './stage';
import {Frame} from './frame';

@autoinject
export class OffCanvasLayout{
  private stage: Stage;
  private inputState: InputState;
  public activeFrameTag = Settings.activeFrameTag;

  constructor(private element: Element){
    this.stage = new Stage();
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
      this.stage.frames.push(frame);
    }

    this.stage.resetFramesPositions();
    this.stage.draw();
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
    this.stage.slideFrames(this.inputState.deltaX);
    this.stage.draw();

    if (this.inputState.isUserDoneSwipping){
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
    let timeRange = timeDelta / Settings.animationDuration;
    let targetDeltaX: number;
    if (this.inputState.isSlidingRight && this.stage.canSlideRight){
      targetDeltaX = 100;
    } else if (this.inputState.isSlidingLeft && this.stage.canSlideLeft){
      targetDeltaX = -100;
    } else if ((this.inputState.isSlidingRight && !this.stage.canSlideRight)
      || (this.inputState.isSlidingLeft && !this.stage.canSlideLeft))
    {
      targetDeltaX = 0;
    } else {
      throw 'Not sure what happened here but couldnt determine which direction to slide';
    }
    let distanceRange = targetDeltaX - this.inputState.deltaX;
    let deltaX = this.inputState.deltaX + (distanceRange * timeRange);

    if (targetDeltaX === -100) {
        deltaX = Math.max(deltaX, targetDeltaX)
    }else if (targetDeltaX === 100){
      deltaX = Math.min(deltaX, targetDeltaX);
    }else if (targetDeltaX === 0){
      if (this.inputState.isSlidingLeft){
        deltaX = Math.min(deltaX, targetDeltaX)
      }else {
        deltaX = Math.max(deltaX, targetDeltaX);
      }
    }

    this.stage.slideFrames(deltaX);
    this.stage.draw();

    if ((targetDeltaX === 0 && this.inputState.isSlidingLeft && deltaX >= 0)
      || (targetDeltaX === 0 && this.inputState.isSlidingRight && deltaX <= 0)
      || ((targetDeltaX === -100 || targetDeltaX === 100) && (deltaX >= 100 || deltaX <= -100))){
      this.startTimestamp = undefined;
      if (targetDeltaX !== 0){
          this.stage.setNewActiveView(this.inputState.isSlidingLeft);
      }
      return;
    }
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
