import {poll} from '../src/poll'

const client = {
  checks: {
    listForRef: jest.fn()
  }
}

const run = () =>
  poll({
    client: client as any,
    log: () => {},
    checkName: 'test',
    owner: 'testOrg',
    repo: 'testRepo',
    ref: 'abcd',
    timeoutSeconds: 3,
    intervalSeconds: 0.1,
    waitForAll: false
  })

test('returns conclusion of completed check', async () => {
  client.checks.listForRef.mockResolvedValue({
    data: {
      check_runs: [
        {
          id: '1',
          status: 'pending'
        },
        {
          id: '2',
          status: 'completed',
          conclusion: 'success'
        }
      ]
    }
  })

  const result = await run()

  expect(result).toBe('success')
  expect(client.checks.listForRef).toHaveBeenCalledWith({
    owner: 'testOrg',
    repo: 'testRepo',
    ref: 'abcd',
    check_name: 'test'
  })
})

test('polls until check is completed', async () => {
  client.checks.listForRef
    .mockResolvedValueOnce({
      data: {
        check_runs: [
          {
            id: '1',
            status: 'pending'
          }
        ]
      }
    })
    .mockResolvedValueOnce({
      data: {
        check_runs: [
          {
            id: '1',
            status: 'pending'
          }
        ]
      }
    })
    .mockResolvedValueOnce({
      data: {
        check_runs: [
          {
            id: '1',
            status: 'completed',
            conclusion: 'failure'
          }
        ]
      }
    })

  const result = await run()

  expect(result).toBe('failure')
  expect(client.checks.listForRef).toHaveBeenCalledTimes(3)
})

test(`returns 'timed_out' if exceeding deadline`, async () => {
  client.checks.listForRef.mockResolvedValue({
    data: {
      check_runs: [
        {
          id: '1',
          status: 'pending'
        }
      ]
    }
  })

  const result = await run()
  expect(result).toBe('timed_out')
})
