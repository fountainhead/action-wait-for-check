import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {poll, pollByID} from './poll'

async function run(): Promise<void> {
    try {
        const token = core.getInput('token', {required: true})

        if (core.getInput('checkName') != null) {
            const result = await poll({
                client: getOctokit(token),
                log: msg => core.info(msg),

                checkName: core.getInput('checkName', {required: true}),
                owner: core.getInput('owner') || context.repo.owner,
                repo: core.getInput('repo') || context.repo.repo,
                ref: core.getInput('ref') || context.sha,

                timeoutSeconds: parseInt(core.getInput('timeoutSeconds') || '600'),
                intervalSeconds: parseInt(core.getInput('intervalSeconds') || '10')
            })

            core.setOutput('conclusion', result)
            return
        }

        if (core.getInput('checkRunID') != null) {
            const result = await pollByID({
                client: getOctokit(token),
                log: msg => core.info(msg),
                checkRunID: parseInt(core.getInput('checkRunID', {required: true})),
                owner: core.getInput('owner') || context.repo.owner,
                repo: core.getInput('repo') || context.repo.repo,
                timeoutSeconds: parseInt(core.getInput('timeoutSeconds') || '600'),
                intervalSeconds: parseInt(core.getInput('intervalSeconds') || '10')
            })

            core.setOutput('conclusion', result)
            return
        }

    } catch (error) {
        core.setFailed(error instanceof Error ? error : JSON.stringify(error))
    }
}

run()
