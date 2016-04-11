import {IFrame} from './frame';
import {Settings} from './settings';
import {InputState} from './input-state';

export class Stage{
  public static slideThreshold = 50;
  public frames: IFrame[];

  constructor(){
    this.frames = [];
  }

  previousDeltaX = 0;
  waitingState = false;

  public update(timeDelta: number, inputState: InputState){
    if (inputState.isUserSwipping){
      this.waitingState = false;
      let deltaXFromLastUpdate = inputState.deltaX - this.previousDeltaX;
      this.previousDeltaX = inputState.deltaX;
      this.slideFrames(deltaXFromLastUpdate);
    }
    else if (inputState.isUserDoneSwipping && !this.waitingState){
      this.previousDeltaX = undefined;
      let closestFrameToCanvas = this.getFrameClosestToCanvas(inputState);
      let timeRange = timeDelta / Settings.animationDuration;
      let targetDeltaX = this.getTargetDeltaX(inputState);
      let distanceRange = targetDeltaX - inputState.deltaX;
      let deltaX = distanceRange * timeRange;
      let distanceToTarget = targetDeltaX - closestFrameToCanvas.xCoordinate;
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
      console.log(`frameCoord ${closestFrameToCanvas.xCoordinate} frame ${closestFrameToCanvas.index} deltaX ${deltaX} distanceToTarget ${distanceToTarget}`)
      this.slideFrames(deltaX);

      if (distanceToTarget === deltaX){
        console.log('target reached');
        if (targetDeltaX !== 0){
          this.setNewActiveFrame(closestFrameToCanvas);
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

  public getFrameClosestToCanvas(inputState: InputState): IFrame{
    let closestFrame: IFrame;
    this.foreachFrame((frame, i) => {
      if (!closestFrame){
        closestFrame = frame;
        return;
      }
      if (Math.abs(frame.xCoordinate) < Math.abs(closestFrame.xCoordinate)){
        closestFrame = frame;
      }
    });
    if (!closestFrame){
      throw 'cannot find the closest frame to the canvas because there are no frames on the stage';
    }
    return closestFrame;
  }

  public resetFramesPositions(){
    let activeIndex = this.getActiveFrame().index;
    this.foreachFrame((frame, i) => {
      frame.xCoordinate = (i - activeIndex) * 100;
    });
  }

  public draw(){
    this.foreachFrame((frame, i) => {
      frame.draw();
    });
  }

  private slideFrames(deltaX: number){
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

  private setNewActiveFrame(activeFrame: IFrame){
    this.foreachFrame((frame, i) => {
      frame.isActive = !!(frame === activeFrame);
    });
  }

  private getActiveFrame(): IFrame{
    let activeFrame: IFrame;
    this.foreachFrame((frame, i) => {
      if (frame.isActive){
        activeFrame = frame;
      }
    });
    if (!activeFrame){
      throw `There are no frames marked with the css class '${Settings.activeFrameTag}'`
       + ' which marks the div on the canvas. All other divs will be'
       + ' rendered off canvas.';
    }
    return activeFrame;
  }

  private foreachFrame(action: (frame: IFrame, i: number) => void){
    for(let i = 0, max = this.frames.length; i < max; i++){
      action.call(this, this.frames[i], i);
    }
  }
}
