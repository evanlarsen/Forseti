
export class InputState{
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
