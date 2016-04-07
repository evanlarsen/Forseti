import {Settings} from './settings';

export class Frame{
  public xCoordinate: number;

  constructor(
    public htmlElement: HTMLElement,
    public index: number)
  {}

  get isActive(){
    return this.htmlElement.classList.contains(Settings.activeFrameTag);
  }

  set isActive(isActive: boolean){
    if (isActive){
      this.htmlElement.classList.add(Settings.activeFrameTag);
    } else {
      this.htmlElement.classList.remove(Settings.activeFrameTag);
    }
  }

  draw(){
    this.htmlElement.style.transform = `translateX(${this.xCoordinate}%)`;
  }
}
