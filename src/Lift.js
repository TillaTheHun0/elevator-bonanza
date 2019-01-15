
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import uuid from 'uuid/v4'
import { distinctUntilChanged, pairwise } from 'rxjs/operators'

const UP = 'GOING UP'
const DOWN = 'GOING DOWN'
const STOPPED = 'STOPPED'

const floorEmitter = new BehaviorSubject(1)
const directionEmitter = new BehaviorSubject(STOPPED)
export class Lift {
  constructor (elevator, numFloors) {
    this.id = uuid()
    this.numFloors = numFloors

    this.floorCount = 0
    this.inMaintenance = false

    this.elevator = elevator

    // Don't expose our BehaviorSubject apis
    this.floor$ = floorEmitter.asObservable()
      .pipe(distinctUntilChanged())

    this.direction$ = directionEmitter.asObservable()
      .pipe(
        pairwise(([prev, cur]) => {
          // State has not changed or in motion, so close the doors. Otherwise open (has arrived)
          prev === cur || cur !== STOPPED ? this.elevator.close() : this.elevator.open()
        }),
        distinctUntilChanged()
      )

    // Emit door and current floor values
    this.elevatorDoor$ = this.elevator.door$.map(door => [door, floorEmitter.getValue()])
  }

  tick () {
    if (this.elevator.isOpen()) {
      return
    }

    let curFloor = floorEmitter.getValue()

    let set = (dir, floor) => {
      this.direction$.next(dir)
      this.floor$.next(floor)
    }

    if (curFloor > this.destination) {
      return set(this.direction$(DOWN), this.floor$.next(curFloor--))
    }

    if (curFloor < this.destination) {
      return set(this.direction$.next(UP), this.floor$.next(curFloor++))
    }

    return set(STOPPED, floorEmitter.getValue())
  }

  cleanup () {
    this.doorSubscription && this.doorSubscription.unsubscribe()
  }

  goToFloor (floorNum) {
    this.destination = floorNum
  }
}
