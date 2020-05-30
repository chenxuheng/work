import Emitter from 'obso/index.mjs'
import Queue from './queue.mjs'
import Planner from './planner.mjs'

class Work extends Emitter {
  /**
   * @param {object} options
   * @param {number} options.maxConcurrency - Defaults to 1.
   * @emits job-start
   * @emits job-end
   */
  constructor (options) {
    super()
    this.name = 'Work'
    this.ctx = undefined // proxy, monitor read and writes via traps
    this.plan = {}
    this.planner = new Planner()
  }

  addService (service, name) {
    this.planner.addService(service, name)
  }

  async process () {
    const root = this.planner.toModel(this.plan)
    return root.process()
  }

  /**
   * Sync iterator yields plan nodes
   */
  * [Symbol.iterator] () {
    const root = this.planner.toModel(this.plan)
    yield * root
  }

  /**
   * Async iterator executes plan yielding results
   */
  async * [Symbol.asyncIterator] () {
    const root = this.planner.toModel(this.plan)
    yield * root
  }
}

export default Work