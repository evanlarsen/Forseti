import {Frame} from './frame';
import {Settings} from './settings';

export class Stage{
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

  public slideFrames(deltaX: number){
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

  public setNewActiveView(isSlidingLeft: boolean){
    let activeIndex = this.getIndexOfActiveFrame();
    let newIndex: number;
    if (isSlidingLeft && this.canSlideLeft){
      newIndex = activeIndex + 1;
    } else if (!isSlidingLeft && this.canSlideRight){
      newIndex = activeIndex - 1;
    } else {
      // index is staying the same
    }
    if (newIndex < 0 || newIndex >= this.frames.length){
      throw "new active index of frames is out of bounds";
    }
    this.foreachFrame((frame, i) => {
      frame.isActive = !!(i === newIndex);
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

  private foreachFrame(action: (frame: Frame, i: number) => void){
    for(let i = 0, max = this.frames.length; i < max; i++){
      action.call(this, this.frames[i], i);
    }
  }
}
