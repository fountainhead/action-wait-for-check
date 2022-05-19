import {GitHub} from '@actions/github'
import {wait} from './wait'

export interface Options {
  client: GitHub
  log: (message: string) => void

  checkName: string
  timeoutSeconds: number
  intervalSeconds: number
  warmupSeconds: number
  owner: string
  repo: string
  ref: string
}

export const poll = async (options: Options): Promise<string> => {
  const {
    client,
    log,
    checkName,
    timeoutSeconds,
    intervalSeconds,
    warmupSeconds,
    owner,
    repo,
    ref
  } = options

  let now = new Date().getTime()
  const deadline = now + timeoutSeconds * 1000
  const warmupDeadline = now + warmupSeconds * 1000
  let foundRun = false

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

    foundRun = foundRun || result.data.check_runs.length !== 0

    if (now >= warmupDeadline && !foundRun) {
      log(
        `No checks found after ${warmupSeconds} seconds, exiting with conclusion 'not_found'`
      )
      return 'not_found'
    }

    const completedCheck = result.data.check_runs.find(
      checkRun => checkRun.status === 'completed'
    )
    if (completedCheck) {
      log(
        `Found a completed check with id ${completedCheck.id} and conclusion ${completedCheck.conclusion}`
      )
      return completedCheck.conclusion
    }

    log(
      `No completed checks named ${checkName}, waiting for ${intervalSeconds} seconds...`
    )
    await wait(intervalSeconds * 1000)

    now = new Date().getTime()
  }

  log(
    `No completed checks after ${timeoutSeconds} seconds, exiting with conclusion 'timed_out'`
  )
  return 'timed_out'
}
