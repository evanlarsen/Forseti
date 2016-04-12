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
    let frame = sut.getFrameClosestToCanvas();
    expect(frame).toEqual(sut.frames[0]);
  });

  it('get closest frame to canvas when swipping far right', () => {
    let inputState = simulateSwipe(sut, 260);
    let frame = sut.getFrameClosestToCanvas();
    expect(frame).toEqual(sut.frames[0]);
  });

  it('get closest frame to canvas when swipping left', () => {
    let inputState = simulateSwipe(sut, -60);
    let frame = sut.getFrameClosestToCanvas();
    expect(frame).toEqual(sut.frames[2]);
  });

  it('get closest frame to canvas when swipping far left', () => {
    let inputState = simulateSwipe(sut, -360);
    let frame = sut.getFrameClosestToCanvas();
    expect(frame).toEqual(sut.frames[3]);
  });
});

describe('when swiping stage update() should', () => {
  let sut: Stage;

  beforeEach(() => {
    sut = createStageStub();
  });

  it('automatically slide to the left frame after the animation duration timespan has passed', () => {
    let inputState = simulateSwipe(sut, 60);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[0].xCoordinate).toEqual(0);
    expect(sut.frames[1].xCoordinate).toEqual(100);
  });

  it('automatically slide to the far left frame after the animation duration timespan has passed', () => {
    let inputState = simulateSwipe(sut, 260);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[0].xCoordinate).toEqual(0);
    expect(sut.frames[1].xCoordinate).toEqual(100);
  });

  it('automatically slide to the right frame after the animation duration timespan has passed', () => {
    let inputState = simulateSwipe(sut, -60);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[1].xCoordinate).toEqual(-100);
    expect(sut.frames[2].xCoordinate).toEqual(0);
    expect(sut.frames[3].xCoordinate).toEqual(100);
  });

  it('automatically slide frame back onto canvas after the animation duration timespan has passed', () => {
    let inputState = simulateSwipe(sut, 30);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[1].xCoordinate).toEqual(0);
    expect(sut.frames[0].xCoordinate).toEqual(-100);
    expect(sut.frames[2].xCoordinate).toEqual(100);
  });

  it('automatically slide frame back onto canvas after the animation duration timespan has passed', () => {
    let inputState = simulateSwipe(sut, -30);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[1].xCoordinate).toEqual(0);
    expect(sut.frames[0].xCoordinate).toEqual(-100);
    expect(sut.frames[2].xCoordinate).toEqual(100);
  });

  it('automatically slide frame back when active frame is the first frame and swipping right', () => {
    let sut = createStageStub(0);
    let inputState = simulateSwipe(sut, 100);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[0].xCoordinate).toEqual(0);
    expect(sut.frames[1].xCoordinate).toEqual(100);
  });

  it('automatically slide frame back when active frame is the last frame and swipping left', () => {
    let sut = createStageStub(3);
    let inputState = simulateSwipe(sut, -100);
    simulateTimeDurationPassing(sut, inputState.deltaX);
    expect(sut.frames[3].xCoordinate).toEqual(0);
    expect(sut.frames[2].xCoordinate).toEqual(-100);
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

function createStageStub(activeIndex?: number): Stage{
  if (!activeIndex){
    activeIndex = 1;
  }
  let stage = new Stage();
  stage.frames.push(new FrameStub(0, !!(activeIndex === 0)));
  stage.frames.push(new FrameStub(1, !!(activeIndex === 1)));
  stage.frames.push(new FrameStub(2, !!(activeIndex === 2)));
  stage.frames.push(new FrameStub(3, !!(activeIndex === 3)));
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

function simulateTimeDurationPassing(sut: Stage, deltaX: number){
  let inputState = new InputState();
  inputState.isUserDoneSwipping = true;
  inputState.deltaX = deltaX;
  sut.update(Settings.animationDuration, inputState);
}
