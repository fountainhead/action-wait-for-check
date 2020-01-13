import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'
import {poll} from './poll'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})

    const result = await poll({
      client: new GitHub(token),
      log: msg => core.info(msg),

      checkName: core.getInput('checkName', {required: true}),
      owner: core.getInput('owner') || context.repo.owner,
      repo: core.getInput('repo') || context.repo.owner,
      ref: core.getInput('ref') || context.sha,

      timeoutSeconds: parseInt(core.getInput('timeoutSeconds') || '600'),
      intervalSeconds: parseInt(core.getInput('intervalSeconds') || '10')
    })

    core.setOutput('conclusion', result)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
