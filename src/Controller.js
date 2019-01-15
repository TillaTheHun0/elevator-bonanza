
import { Lift } from './Lift'
import { Elevator } from './Elevator'
import { combineLatest } from 'rxjs/operators'
import { Subject } from 'rxjs/Subject'

import { UP, DOWN, STOPPED } from './Direction'

export class ElevatorCtrl {
  constructor (numElevators, numFloors) {
    this.numElevators = numElevators
    this.numFloors = numFloors
    this.lifts = []

    this.subs = []

    // logger
    this.log = new Subject().tap(line => console.log(line))
  }

  _init () {
    [...Array(this.numElevators)].forEach(() => {
      this.lifts.push(new Lift(new Elevator(), this.numFloors))
    })

    // subscribe to each lift and log events to main logger
    this.lifts.forEach((lift, i) => {
      let { floor$, direction$, elevatorDoor$ } = lift

      this.subs.push(
        combineLatest(floor$, direction$, elevatorDoor$)
          .pipe(
            ([floor, direction, elevatorDoor]) => {
              this.log.next(`Lift ${i} currently ${direction} and at floor ${floor} with doors ${elevatorDoor}`)
            }
          ).subscribe()
      )
      // subscribe to logger
      this.subs.push(this.log.subscribe())
    })
  }

  _cleanup () {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  requestAt (floorNum) {
    let dispatched = null

    let validLifts = this.lifts
      .filter(lift => !lift.inMaintenance)
      .filter(lift => {
        return floorNum === lift.curFloor ||
          (floorNum - lift.curFloor >= 1 && lift.curDirection === UP) ||
          (floorNum - lift.curFloor <= 1 && lift.curDirection === DOWN) ||
          lift.direction === STOPPED
      })

    let distances = validLifts.map(lift => Math.abs(floorNum - lift.curFloor))

    let min = Math.min(...distances)

    dispatched = validLifts[distances.findIndex(distance => distance === min)]

    dispatched && dispatched.goToFloor(floorNum)
  }
}
