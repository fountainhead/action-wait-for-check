import {poll, pollByID} from '../src/poll'

const client = {
    rest: {
        checks: {
            listForRef: jest.fn(),
            get: jest.fn(),
        }
    }
}

const run = () =>
    poll({
        client: client as any,
        log: () => {},
        checkName: 'test',
        checkRunID: 123,
        owner: 'testOrg',
        repo: 'testRepo',
        ref: 'abcd',
        timeoutSeconds: 3,
        intervalSeconds: 0.1
    })

test('returns conclusion of completed check', async () => {
    client.rest.checks.listForRef.mockResolvedValue({
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
    expect(client.rest.checks.listForRef).toHaveBeenCalledWith({
        owner: 'testOrg',
        repo: 'testRepo',
        ref: 'abcd',
        check_name: 'test'
    })
})

test('polls until check is completed', async () => {
    client.rest.checks.listForRef
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
    expect(client.rest.checks.listForRef).toHaveBeenCalledTimes(3)
})

test(`returns 'timed_out' if exceeding deadline`, async () => {
    client.rest.checks.listForRef.mockResolvedValue({
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

const runByID = () =>
    pollByID({
        client: client as any,
        log: () => {},
        checkRunID: 123,
        owner: 'testOrg',
        repo: 'testRepo',
        timeoutSeconds: 3,
        intervalSeconds: 0.1
    });

client.rest.checks.get = jest.fn();

test('returns conclusion of completed check by ID', async () => {
    client.rest.checks.get.mockResolvedValue({
        data: {
            id: 123,
            status: 'completed',
            conclusion: 'success'
        }
    });

    const result = await runByID();

    expect(result).toBe('success');
    expect(client.rest.checks.get).toHaveBeenCalledWith({
        check_run_id: 123,
        owner: 'testOrg',
        repo: 'testRepo'
    });
});

test('polls until check by ID is completed', async () => {
    client.rest.checks.get
        .mockResolvedValueOnce({
            data: {
                id: 123,
                status: 'pending'
            }
        })
        .mockResolvedValueOnce({
            data: {
                id: 123,
                status: 'completed',
                conclusion: 'failure'
            }
        });

    const result = await runByID();

    expect(result).toBe('failure');
    expect(client.rest.checks.get).toHaveBeenCalledTimes(2);
});

test(`returns 'timed_out' if exceeding deadline by ID`, async () => {
    client.rest.checks.get.mockResolvedValue({
        data: {
            id: 123,
            status: 'pending'
        }
    });

    const result = await runByID();
    expect(result).toBe('timed_out');
});
