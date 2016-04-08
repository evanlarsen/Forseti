import {Frame} from './frame';
import {Settings} from './settings';
import {InputState} from './input-state';

export class Stage{
  public static slideThreshold = 50;
  public frames: Frame[];
  constructor(){
    this.frames = [];
  }

  previousDeltaX: number;
  waitingState = false;

  public update(timeDelta: number, inputState: InputState){
    if (inputState.isUserSwipping){
      if (!this.previousDeltaX){
        this.previousDeltaX = inputState.deltaX;
        this.waitingState = false;
      }
      let deltaXFromLastUpdate = inputState.deltaX - this.previousDeltaX;
      this.previousDeltaX = inputState.deltaX;
      this.slideFrames(deltaXFromLastUpdate);
    }
    else if (inputState.isUserDoneSwipping && !this.waitingState){
      this.previousDeltaX = undefined;
      let activeFrame = this.getFrameClosestToOrigin();
      let timeRange = timeDelta / Settings.animationDuration;
      let targetDeltaX = this.getTargetDeltaX(inputState);
      let distanceRange = targetDeltaX - inputState.deltaX;
      let deltaX = distanceRange * timeRange;
      let distanceToTarget = targetDeltaX - activeFrame.xCoordinate;
      if (targetDeltaX === -100) {
          deltaX = Math.max(deltaX, distanceToTarget)
      }else if (targetDeltaX === 100){
        deltaX = Math.min(deltaX, distanceToTarget);
      }else if (targetDeltaX === 0){
        if (inputState.isSlidingLeft){
          deltaX = Math.min(deltaX, distanceToTarget)
        }else {
          deltaX = Math.max(deltaX, distanceToTarget);
        }
      }
      console.log(`frameCoord ${activeFrame.xCoordinate} frame ${activeFrame.index} deltaX ${deltaX} distanceToTarget ${distanceToTarget}`)
      this.slideFrames(deltaX);

      if (distanceToTarget === deltaX){
        console.log('target reached');
        if (targetDeltaX !== 0){
          this.setNewActiveFrame(activeFrame);
        }
        this.waitingState = true;
      }
    }
  }

  private getTargetDeltaX(inputState: InputState): number{
    let targetDeltaX: number;
    if (inputState.isSlidingRight && this.canSlideRight){
      targetDeltaX = 100;
    } else if (inputState.isSlidingLeft && this.canSlideLeft){
      targetDeltaX = -100;
    } else if ((inputState.isSlidingRight && !this.canSlideRight)
      || (inputState.isSlidingLeft && !this.canSlideLeft))
    {
      targetDeltaX = 0;
    } else {
      throw 'Not sure what happened here but couldnt determine which direction to slide';
    }
    return targetDeltaX;
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

  public slideFrames(deltaX: number){
    this.foreachFrame((frame, i) => {
      frame.xCoordinate = frame.xCoordinate + deltaX;
    });
  }

  get canSlideRight(): boolean{
    return !this.frames[0].isActive;
  }

  get canSlideLeft(): boolean{
    return !this.frames[this.frames.length - 1].isActive;
  }

  public setNewActiveFrame(activeFrame: Frame){
    this.foreachFrame((frame, i) => {
      frame.isActive = !!(frame === activeFrame);
    });
  }

  private getIndexOfActiveFrame(){
    for(let i = 0, max = this.frames.length; i < max; i++){
      if (this.frames[i].htmlElement.classList.contains(Settings.activeFrameTag)){
        return i;
      }
    }
    throw `There are no frames marked with the css class '${Settings.activeFrameTag}'`
     + ' which marks the div on the canvas. All other divs will be'
     + ' rendered off canvas.';
  }

  private getFrameClosestToOrigin(): Frame{
    let foundFrame: Frame;
    this.foreachFrame((frame, i) => {
      if (!foundFrame){
        foundFrame = frame;
      }
      if (Math.abs(frame.xCoordinate) < foundFrame.xCoordinate){
        foundFrame = frame;
      }
    });
    return foundFrame;
  }

  private foreachFrame(action: (frame: Frame, i: number) => void){
    for(let i = 0, max = this.frames.length; i < max; i++){
      action.call(this, this.frames[i], i);
    }
  }
}
