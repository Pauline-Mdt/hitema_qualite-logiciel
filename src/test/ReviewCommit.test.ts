process.env.ANTHROPIC_API_KEY = 'mock-anthropic-api-key';
process.env.FINE_GRAINED_TOKEN = 'mock-github-token';
process.env.OWNER = 'mock-owner';
process.env.REPO = 'mock-repo';
process.env.COMMIT_SHA = 'mock-commit-sha';

import ReviewCommit from "../ReviewCommit";

jest.mock('@anthropic-ai/sdk', () => {
    return jest.fn().mockImplementation(() => {
        return {
            messages: {
                create: jest.fn().mockResolvedValue({
                    content: [
                        {
                            type: 'text',
                            text: 'Mock analysis response'
                        }
                    ]
                })
            }
        };
    });
});

jest.mock('octokit', () => {
    return {
        Octokit: jest.fn().mockImplementation(() => {
            return {
                rest: {
                    repos: {
                        getCommit: jest.fn().mockResolvedValue({
                            data: {
                                files: [
                                    {patch: 'Mock patch'},
                                    {patch: 'Mock patch'},
                                    {patch: 'Mock patch'},
                                ]
                            }
                        }),
                        createCommitComment: jest.fn().mockResolvedValue({
                            data: {
                                html_url: 'https://mock-commit-comment-url.com'
                            }
                        })
                    }
                }
            };
        })
    };
});

describe('ReviewCommit', () => {
    let reviewCommit: ReviewCommit;

    beforeEach(() => {
        reviewCommit = new ReviewCommit();
    });

    it('should initialize anthropic and octokit instances', async () => {
        await reviewCommit['initialized'];
        expect(reviewCommit['anthropic']).toBeDefined();
        expect(reviewCommit['octokit']).toBeDefined();
    });

    it('should get commit diffs', async () => {
        const commitDiffs = await reviewCommit.getCommitDiffs('owner', 'repo', 'commitSha');
        expect(commitDiffs).toEqual('Mock patch\nMock patch\nMock patch');
    });

    it('should ai analyze commit diff', async () => {
        const analysis = await reviewCommit.aiAnalyzeCommitDiff('Mock diff');
        expect(analysis).toEqual({type: 'text', text: 'Mock analysis response'});
    });

    it('should analyze commit', async () => {
        const analysis = await reviewCommit.analyzeCommit('owner', 'repo', 'commitSha');
        expect(analysis).toEqual('# Code Review\n\n Analysis for commit commitSha:\n\n Mock analysis response');
    });

    it('should create commit comment', async () => {
        const commentUrl = await reviewCommit.createCommitComment('owner', 'repo', 'commitSha');
        expect(commentUrl).toEqual('https://mock-commit-comment-url.com');
    });

    it("should review code", async () => {
        const commentUrl = await reviewCommit.reviewCode('owner', 'repo', 'commitSha');
        expect(commentUrl).toEqual('https://mock-commit-comment-url.com');
    });
});