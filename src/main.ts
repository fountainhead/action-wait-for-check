import * as core from '@actions/core'
import github, {context} from '@actions/github'
import {poll} from './poll'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})

    const result = await poll({
      client: github.getOctokit(token),
      log: msg => core.info(msg),

      checkName: core.getInput('checkName', {required: true}),
      owner: core.getInput('owner') || context.repo.owner,
      repo: core.getInput('repo') || context.repo.repo,
      ref: core.getInput('ref') || context.sha,

      timeoutSeconds: parseInt(core.getInput('timeoutSeconds') || '600'),
      intervalSeconds: parseInt(core.getInput('intervalSeconds') || '10')
    })

    core.setOutput('conclusion', result)
  } catch (error) {
    core.setFailed(error instanceof Error ? error : JSON.stringify(error))
  }
}

run()
