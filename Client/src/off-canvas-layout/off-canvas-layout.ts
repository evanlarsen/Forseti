import {autoinject} from 'aurelia-framework';
import * as Hammer from 'hammerjs';
import {InputState} from './input-state';
import {Stage} from './stage';
import {Frame} from './frame';
import {Settings} from './settings';
import {Events} from '../infrastructure/events';

@autoinject
export class OffCanvasLayout{
  private stage: Stage;
  private inputState: InputState;
  public activeFrameTag = Settings.activeFrameTag;

  constructor(private element: Element, private events: Events){
    this.stage = new Stage(events);
    this.inputState = new InputState();
  }

  attached(){
    this.initializeContent();
    window.requestAnimationFrame(this.gameLoop);
    let recognizer = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10});
    let hammer = new Hammer(<HTMLElement>this.element, {});
    hammer.add(recognizer);
    hammer.on('pan', this.onPan.bind(this));
  }

  private initializeContent(){
    let frames = this.element.querySelectorAll('.off-canvas-content');
    for(let i = 0, max = frames.length; i < max; i++){
      let frame = new Frame(<HTMLElement>frames[i], i)
      this.stage.frames.push(frame);
    }
    this.stage.resetFramesPositions();
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
    this.events.publish('gameloop:update', { timeDelta: timeDelta, inputState: this.inputState });
    this.stage.draw();
    this.events.publish('gameloop:draw');

    this.lastTimestamp = timestamp;
    window.requestAnimationFrame(this.gameLoop);
  }
}
