import {autoinject} from 'aurelia-framework';
import * as Hammer from 'hammerjs';
import * as rx from 'rx';
import {InputState} from './input-state';
import {Stage} from './stage';
import {Frame} from './frame';
import {Settings} from './settings';

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

    this.watchPan()
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
    window.requestAnimationFrame(this.gameLoop);
  }

  private onPan(event : HammerInput){
    this.inputState.deltaX = 100*event.deltaX / window.innerWidth;
    this.inputState.isUserDoneSwipping = false;

    if (!this.inputState.isUserSwipping){
      this.inputState.isUserSwipping = true;
    }

    if (event.isFinal){
      this.inputState.isUserSwipping = false;
      this.inputState.isUserDoneSwipping = true;
    }
  }

  lastTimestamp: number;

  gameLoop = this._gameLoop.bind(this);
  private _gameLoop(timestamp: number){
    if (!this.lastTimestamp){
      this.lastTimestamp = timestamp;
    }
    let timeDelta = timestamp - this.lastTimestamp;

    this.stage.update(timeDelta, this.inputState);
    this.stage.draw();

    this.lastTimestamp = timestamp;
    window.requestAnimationFrame(this.gameLoop);
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
