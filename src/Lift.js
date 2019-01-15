
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

import uuid from 'uuid/v4'
import { distinctUntilChanged, pairwise, tap } from 'rxjs/operators'

import { UP, DOWN, STOPPED } from './Direction'

const floorEmitter = new BehaviorSubject(1)
const directionEmitter = new BehaviorSubject(STOPPED)
export class Lift {
  constructor (elevator, numFloors) {
    this.id = uuid()
    this.numFloors = numFloors

    this.floorCount = 0
    this.inMaintenance = false

    this.destinations = []

    this.elevator = elevator

    // Don't expose our BehaviorSubject apis
    this.floor$ = floorEmitter.asObservable()
      .pipe(
        distinctUntilChanged(),
        tap(curFloor => { this.curFloor = curFloor })
      )

    this.direction$ = directionEmitter.asObservable()
      .pipe(
        pairwise(([prev, cur]) => {
          // State has not changed or in motion, so close the doors. Otherwise open (has arrived)
          prev === cur || cur !== STOPPED || this.inMaintenance
            ? this.elevator.close() : this.elevator.open()
        }),
        distinctUntilChanged(),
        tap(curDirection => { this.curDirection = curDirection })
      )

    // Emit door and current floor values
    this.elevatorDoor$ = this.elevator.door$.map(door => [door, this.curFloor])
  }

  tick () {
    let set = (dir, floor) => {
      this.direction$.next(dir)
      this.floor$.next(floor)
    }

    let curFloor = this.curFloor

    // cur destination
    let destination = this.destinations.length ? this.destinations[0] : null

    // elevator is open or in maintenance
    if (this.elevator.isOpen() || this.inMaintenance || !destination) {
      set(STOPPED, curFloor)
      return
    }

    if (curFloor > destination) {
      this.floorCount++
      set(this.direction$(DOWN), this.floor$.next(curFloor--))
    } else if (curFloor < destination) {
      this.floorCount++
      set(this.direction$.next(UP), this.floor$.next(curFloor++))
    } else {
      set(STOPPED, floorEmitter.getValue())
      // if destinations remove the front one
      this.destinations.length && this.destinations.shift()
    }

    this.inMaintenance = this.floorCount >= 100
  }

  cleanup () {
    this.doorSubscription && this.doorSubscription.unsubscribe()
  }

  goToFloor (floorNum) {
    // destinations is a stack, in case the elevator is told to make an intermediate stop on the way
    // it will make that stop, pop off the destination, then continue to the original destination
    this.destinations.unshift(floorNum)
  }
}
