process.env.ANTHROPIC_API_KEY = 'mock-anthropic-api-key';
process.env.FINE_GRAINED_TOKEN = 'mock-github-token';
process.env.OWNER = 'mock-owner';
process.env.REPO = 'mock-repo';
process.env.COMMIT_SHA = 'mock-commit-sha';

import ReviewCommit from "../ReviewCommit";

jest.mock('@anthropic-ai/sdk');
// jest.mock('octokit', () => {
//     return {
//         Octokit: jest.fn().mockImplementation(() => {
//             return {
//                 rest: {
//                     repos: {
//                         getCommit: jest.fn(),
//                         createCommitComment: jest.fn(),
//                     },
//                 },
//             };
//         }),
//     };
// });

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
                                html_url: 'Mock commit comment URL'
                            }
                        })
                    }
                }
            };
        })
    };
});

describe('ReviewCommit', () => {
    // it('should pass a basic test', () => {
    //     expect(true).toEqual(true);
    // });

    let reviewCommit: ReviewCommit;

    beforeEach(() => {
        reviewCommit = new ReviewCommit();
    });

    it('should initialize anthropic and octokit instances', async () => {
        await reviewCommit['initialized'];
        expect(reviewCommit['anthropic']).toBeDefined();
        expect(reviewCommit['octokit']).toBeDefined();
    });
});