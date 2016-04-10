import {Stage} from '../../../src/off-canvas-layout/stage';
import {IFrame} from '../../../src/off-canvas-layout/frame';
import {Settings} from '../../../src/off-canvas-layout/settings';

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

describe('the off-canvas-layout stage', () => {
  let stage: Stage;

  beforeEach(() => {
    stage = createStageStub();
  });

  it('confirm that xCoordinates are working', () => {
    expect(stage.frames[0].xCoordinate).toEqual(-100);
    expect(stage.frames[1].xCoordinate).toEqual(0);
    expect(stage.frames[2].xCoordinate).toEqual(100);
    expect(stage.frames[3].xCoordinate).toEqual(200);
  });
});
