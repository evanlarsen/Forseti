import {Stage} from '../../../src/off-canvas-layout/stage';
import {IFrame} from '../../../src/off-canvas-layout/frame';
import {Settings} from '../../../src/off-canvas-layout/settings';
import {InputState} from '../../../src/off-canvas-layout/input-state';

describe('off-canvas-layout.stage - ', () => {
  let sut: Stage;

  beforeEach(() => {
    sut = createStageStub();
  });

  it('confirm that xCoordinates are working', () => {
    expect(sut.frames[0].xCoordinate).toEqual(-100);
    expect(sut.frames[1].xCoordinate).toEqual(0);
    expect(sut.frames[2].xCoordinate).toEqual(100);
    expect(sut.frames[3].xCoordinate).toEqual(200);
  });
});

describe('when swipping stage getClosestFrameToCanvas() should', () => {
  let sut: Stage;

  beforeEach(() => {
    sut = createStageStub();
  });

  it('get closest frame to canvas when swipping right', () => {
    let inputState = simulateSwipe(sut, 60);
    let frame = sut.getFrameClosestToCanvas(inputState);
    expect(frame).toEqual(sut.frames[0]);
  });

  it('get closest frame to canvas when swipping far right', () => {
    let inputState = simulateSwipe(sut, 260);
    let frame = sut.getFrameClosestToCanvas(inputState);
    expect(frame).toEqual(sut.frames[0]);
  });

  it('get closest frame to canvas when swipping left', () => {
    let inputState = simulateSwipe(sut, -60);
    let frame = sut.getFrameClosestToCanvas(inputState);
    expect(frame).toEqual(sut.frames[2]);
  });

  it('get closest frame to canvas when swipping far left', () => {
    let inputState = simulateSwipe(sut, -360);
    let frame = sut.getFrameClosestToCanvas(inputState);
    expect(frame).toEqual(sut.frames[3]);
  });
});

class FrameStub implements IFrame {
  xCoordinate: number;
  htmlElement: HTMLElement;
  constructor(public index: number, public isActive?: boolean){

  }
  draw(){
    throw "not implemented";
  }
}

function createStageStub(): Stage{
  let stage = new Stage();
  stage.frames.push(new FrameStub(0));
  stage.frames.push(new FrameStub(1, true));
  stage.frames.push(new FrameStub(2));
  stage.frames.push(new FrameStub(3));
  stage.resetFramesPositions();
  return stage;
}

function simulateSwipe(sut: Stage, deltaX: number){
  let inputState = new InputState();
  inputState.isUserSwipping = true;
  inputState.deltaX = deltaX;
  sut.update(0, inputState);
  return inputState;
}
