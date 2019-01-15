
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

const OPEN = 1
const CLOSED = 0

export class Elevator {
  constructor () {
    this.doorEmitter = new BehaviorSubject(CLOSED)
  }

  open () {
    this.doorEmitter.next(OPEN)
  }

  close () {
    this.doorEmitter.next(CLOSED)
  }
}
