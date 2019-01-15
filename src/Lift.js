
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import uuid from 'uuid/v4'

export class Lift {
  constructor (elevator, floors) {
    this.id = uuid()

    this.elevator = elevator
    this.floors = floors

    this.curFloor = 0

    this.floorEmitter = new BehaviorSubject(0)
  }

  zero () {

  }
}
