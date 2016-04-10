import {Settings} from './settings';

export interface IFrame{
  isActive: boolean;
  xCoordinate: number;
  index: number;
  draw: () => void;
}

export class Frame implements IFrame{
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
