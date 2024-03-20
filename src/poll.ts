import {GitHub} from '@actions/github/lib/utils'
import {wait} from './wait'

export interface Options {
  client: InstanceType<typeof GitHub>
  log: (message: string) => void

  checkName?: string
  checkRunID?: number
  timeoutSeconds: number
  intervalSeconds: number
  owner: string
  repo: string
  ref?: string
}

export const poll = async (options: Options): Promise<string> => {
  const {
    client,
    log,
    checkName,
    timeoutSeconds,
    intervalSeconds,
    owner,
    repo,
    ref
  } = options

  let now = new Date().getTime()
  const deadline = now + timeoutSeconds * 1000

  while (now <= deadline) {
    log(
      `Retrieving check runs named ${checkName} on ${owner}/${repo}@${ref}...`
    )
    const result = await client.rest.checks.listForRef({
      check_name: checkName,
      owner,
      repo,
      ref: ref!,
    })

    log(
      `Retrieved ${result.data.check_runs.length} check runs named ${checkName}`
    )

    const completedCheck = result.data.check_runs.find(
      checkRun => checkRun.status === 'completed'
    )
    if (completedCheck) {
      log(
        `Found a completed check with id ${completedCheck.id} and conclusion ${completedCheck.conclusion}`
      )
      // conclusion is only `null` if status is not `completed`.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return completedCheck.conclusion!
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

export const pollByID = async (options: Options): Promise<string> => {
  const {
    client,
    log,
    checkRunID,
    timeoutSeconds,
    intervalSeconds,
    owner,
    repo,
  } = options

  let now = new Date().getTime()
  const deadline = now + timeoutSeconds * 1000

  while (now <= deadline) {
    log(
      `Retrieving check runs with ID ${checkRunID} on ${owner}/${repo}...`
    )
    const result = await client.rest.checks.get({
      check_run_id: checkRunID!,
      owner,
      repo,
    })
    const checkName = result.data.name

    log(
      `Retrieved check run named ${checkName}`
    )

    //const completedCheck = result.data.check_runs.find(
      //checkRun => checkRun.status === 'completed'
    //)
    const completedCheck = result.data.status === 'completed'
    if (completedCheck) {
      log(
        `Found a completed check with id ${result.data.id}, name ${checkName} and conclusion ${result.data.conclusion}`
      )
      // conclusion is only `null` if status is not `completed`.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return result.data.conclusion!
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

