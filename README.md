<p align="center">
  <a href="https://github.com/fountainhead/action-wait-for-check/actions"><img alt="action-wait-for-check status" src="https://github.com/fountainhead/action-wait-for-check/workflows/build-test/badge.svg"></a>
</p>

# GitHub Action: Wait for Check

A GitHub Action that allows you to wait for another GitHub check to complete. This is useful if you want to run one Workflow after another one finishes.

## Example Usage

```yaml
    steps:
      - name: Wait for build to succeed
        uses: fountainhead/action-wait-for-check@v1.1.0
        id: wait-for-build
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          checkName: build
          ref: ${{ github.head_ref || github.ref }}

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

  **IMPORTANT**: If the check you're referencing is provided by another GitHub Actions workflow, make sure that you reference the name of a _Job_ within that workflow, and _not_ the name the _Workflow_ itself.

- `ref`

  **Default: `github.ref`**

  The Git ref of the commit you want to poll for a passing check.

  _PROTIP: You may want to use `github.head_ref` when working with Pull Requests._

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

## Outputs

This Action emits a single output named `conclusion`. Like the field of the same name in the [CheckRunEvent API Response](https://developer.github.com/v3/activity/events/types/#checkrunevent-api-payload), it may be one of the following values:

- `success`
- `failure`
- `neutral`
- `timed_out`
- `action_required`

These correspond to the `conclusion` state of the Check you're waiting on. In addition, this action will emit a conclusion of `timed_out` if the Check specified didn't complete within `timeoutSeconds`.
