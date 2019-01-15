
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import uuid from 'uuid/v4'

const UP = 'UP'
const DOWN = 'DOWN'
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
  }

  _init () {
    this.elevator
  }

  zero () {

  }

  tick () {

  }
}
