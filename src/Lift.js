
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import uuid from 'uuid/v4'

const UP = 'GOING UP'
const DOWN = 'GOING DOWN'
const STOPPED = 'STOPPED'

const floorEmitter = new BehaviorSubject(0)
const directionEmitter = new BehaviorSubject(STOPPED)
export class Lift {
  constructor (elevator, numFloors) {
    this.id = uuid()
    this.numFloors = numFloors

    this.elevator = elevator

    // Don't expose our BehaviorSubject apis
    this.floor$ = floorEmitter.asObservable()
    this.direction$ = directionEmitter.asObservable()
    // emit door and current floor values
    this.elevatorDoor$ = this.elevator.door$.map(door => [door, floorEmitter.getValue()])
  }

  tick () {

  }

  cleanup () {
    this.doorSubscription && this.doorSubscription.unsubscribe()
  }
}
