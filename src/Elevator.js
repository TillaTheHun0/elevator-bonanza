
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import uuid from 'uuid/v4'
import { distinctUntilChanged } from 'rxjs/operators'

const OPEN = 1
const CLOSED = 0

const doorEmitter = new BehaviorSubject(CLOSED)

// Merely mantains state of elevator doors and nothing else
export class Elevator {
  constructor () {
    this.id = uuid()
    this.door$ = doorEmitter.asObservable()
      .pipe(
        distinctUntilChanged()
      )
  }

  open () {
    this.doorEmitter.next(OPEN)
  }

  close () {
    this.doorEmitter.next(CLOSED)
  }

  isOpen () {
    return this.doorEmitter.getValue() === OPEN
  }
}
