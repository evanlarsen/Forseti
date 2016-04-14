import {IFrame} from './frame';
import {Settings} from './settings';
import {InputState} from './input-state';
import {IEvents} from '../infrastructure/events';

export class Stage{
  public static slideThreshold = 50;
  public frames: IFrame[];

  constructor(private events?: IEvents){
    this.frames = [];
  }

  previousDeltaX = 0;
  waitingState = false;
  updateCalled = 0;
  public update(timeDelta: number, inputState: InputState){
    this.updateCalled++;
    if (inputState.isUserSwipping){
      this.waitingState = false;
      let deltaXFromLastUpdate = inputState.deltaX - this.previousDeltaX;
      this.previousDeltaX = inputState.deltaX;
      this.slideFrames(deltaXFromLastUpdate);
      this.publishEvent('stage-update', {inputState: inputState, updateCalled: this.updateCalled});
    }
    else if (inputState.isUserDoneSwipping && !this.waitingState){
      this.previousDeltaX = 0;
      let closestFrameToCanvas = this.getFrameClosestToCanvas();
      let timeRange = timeDelta / Settings.animationDuration;
      let distanceToTarget = -closestFrameToCanvas.xCoordinate;
      let distanceOverTime = distanceToTarget * timeRange;

      if (distanceToTarget > 0){
        distanceOverTime = Math.min(distanceOverTime, distanceToTarget);
      } else {
        distanceOverTime = Math.max(distanceOverTime, distanceToTarget);
      }

      this.publishEvent('stage-update', {inputState: inputState, closestFrameToCanvas: closestFrameToCanvas, deltaX: distanceOverTime, distanceToTarget: distanceToTarget, updateCalled: this.updateCalled});
      this.slideFrames(distanceOverTime);

      if (distanceToTarget === distanceOverTime){
        this.setNewActiveFrame(closestFrameToCanvas);
        this.waitingState = true;
      }
    }
  }

  private publishEvent(event: string, data: any){
    if (this.events){
      this.events.publish(event, data);
    }
  }

  public getFrameClosestToCanvas(): IFrame{
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
