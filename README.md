<p align="center">
  <a href="https://github.com/fountainhead/action-wait-for-check/actions"><img alt="action-wait-for-check status" src="https://github.com/fountainhead/action-wait-for-check/workflows/build-test/badge.svg"></a>
</p>

# GitHub Action: Wait for Check

A GitHub Action that allows you to wait for another GitHub check to complete. This is useful if you want to run one Workflow after another one finishes.

## Example Usage

```yaml
    steps:
      - name: Wait for build to succeed
        uses: fountainhead/action-wait-for-check@v1.0.0
        id: wait-for-build
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          checkName: build
          ref: github.event.pull_request.head.sha || github.sha

      - name: Do something with a passing build
        if: steps.wait-for-build.outputs.conclusion == 'success'

      - name: Do something with a failing build
        if: steps.wait-for-build.outputs.conclusion == 'failure'
```
## Inputs

This Action accepts the following configuration parameters via `with:`

- `token`

  **Required**
  
  The GitHub token to use for making API requests. Typically, this would be set to `${{ secrets.GITHUB_TOKEN }}`.
  
- `checkName`

  **Required**
  
  The name of the GitHub check to wait for. For example, `build` or `deploy`.

- `ref`

  **Default: `github.sha`**
  
  The Git ref of the commit you want to poll for a passing check.
  
  *PROTIP: You may want to use `github.pull_request.head.sha` when working with Pull Requests.*

  
- `repo`

  **Default: `github.repo.repo`**
  
  The name of the Repository you want to poll for a passing check.

- `owner`

  **Default: `github.repo.owner`**
  
  The name of the Repository's owner you want to poll for a passing check.

- `timeoutSeconds`

  **Default: `600`**

  The number of seconds to wait for the check to complete. If the check does not complete within this amount of time, this Action will emit a `conclusion` value of `timed_out`.
  
- `intervalSeconds`

  **Default: `10`**

  The number of seconds to wait before each poll of the GitHub API for checks on this commit.

- `waitForAll`

  **Default: `false`**
  
  Wait for all the checks to complete. Returns the highest priority conclusion.
## Outputs

This Action emits a single output named `conclusion`. Like the field of the same name in the [CheckRunEvent API Response](https://developer.github.com/v3/activity/events/types/#checkrunevent-api-payload), it may be one of the following values:

- `success`
- `stale`
- `neutral`
- `cancelled`
- `timed_out`
- `failure`
- `action_required`

These correspond to the `conclusion` state of the Check you're waiting on. In addition, this action will emit a conclusion of `timed_out` if the Check specified didn't complete within `timeoutSeconds`.
