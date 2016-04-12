import {EventAggregator} from 'aurelia-event-aggregator';
import {autoinject} from 'aurelia-framework';

@autoinject
export class DebugInfo{
  isUserSwipping: boolean;
  inputStateDeltaX: number;
  isUserDoneSwipping: boolean;
  closestFrameIsActive: boolean;
  closestFramexCoordinate: number;
  closestFrameIndex: number;
  updateCalled: number;

  constructor(private eventAggregator: EventAggregator){
    //{inputState: inputState, closestFrameToCanvas: closestFrameToCanvas, deltaX: deltaX, distanceToTarget: distanceToTarget});
    this.eventAggregator.subscribe('stage-update', payload => {
      if (payload.inputState){
        this.isUserSwipping = payload.inputState.isUserSwipping;
        this.inputStateDeltaX = payload.inputState.deltaX;
        this.isUserDoneSwipping = payload.inputState.isUserDoneSwipping;
      }
      if (payload.closestFrameToCanvas){
        this.closestFrameIsActive = payload.closestFrameToCanvas.isActive;
        this.closestFramexCoordinate = payload.closestFrameToCanvas.xCoordinate;
        this.closestFrameIndex = payload.closestFrameToCanvas.index;
      }
      this.updateCalled = payload.updateCalled;
    });
  }
}
