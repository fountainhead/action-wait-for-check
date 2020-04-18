import {GitHub} from '@actions/github'
import {wait} from './wait'

export interface Options {
  client: GitHub
  log: (message: string) => void

  checkName: string
  timeoutSeconds: number
  intervalSeconds: number
  owner: string
  repo: string
  ref: string
  waitForAll: boolean
}

/* eslint-disable @typescript-eslint/camelcase */
const ConclusionPriority: {[key: string]: number} = {
  success: 0,
  stale: 1,
  neutral: 2,
  cancelled: 3,
  timed_out: 4,
  failure: 5,
  action_required: 6
}
/* eslint-enable @typescript-eslint/camelcase */

export const poll = async (options: Options): Promise<string> => {
  const {
    client,
    log,
    checkName,
    timeoutSeconds,
    intervalSeconds,
    owner,
    repo,
    ref,
    waitForAll
  } = options

  let now = new Date().getTime()
  const deadline = now + timeoutSeconds * 1000

  while (now <= deadline) {
    log(
      `Retrieving check runs named ${checkName} on ${owner}/${repo}@${ref}...`
    )
    const result = await client.checks.listForRef({
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_name: checkName,
      owner,
      repo,
      ref
    })

    log(
      `Retrieved ${result.data.check_runs.length} check runs named ${checkName}`
    )

    const completedChecks = result.data.check_runs.filter(
      checkRun => checkRun.status === 'completed'
    )
    if (
      completedChecks.length &&
      (!waitForAll || completedChecks.length === result.data.check_runs.length)
    ) {
      for (const check of completedChecks) {
        log(
          `Check completed with id ${check.id} and conclusion ${check.conclusion}`
        )
      }
      return completedChecks.reduce(
        (conclusion, check) =>
          ConclusionPriority[check.conclusion] > ConclusionPriority[conclusion]
            ? check.conclusion
            : conclusion,
        'success'
      )
    }

    log(`Waiting on ${checkName} for ${intervalSeconds} seconds...`)
    await wait(intervalSeconds * 1000)

    now = new Date().getTime()
  }

  log(
    `No completed checks after ${timeoutSeconds} seconds, exiting with conclusion 'timed_out'`
  )
  return 'timed_out'
}
