import Anthropic from "@anthropic-ai/sdk";
// import {Octokit} from "octokit";
// let Octokit;
// import ("octokit").then((module) => {
//     Octokit = module.Octokit;
// });
//
// const githubToken = process.env.GITHUB_TOKEN;
// const apiKey = process.env.ANTHROPIC_API_KEY;
// const anthropic = new Anthropic({
//     apiKey: process.env.ANTHROPIC_API_KEY,
// });
// const octokit = new Octokit.Octokit({
//     auth: githubToken
// });
//
// export async function getCommitDiffs(owner: string, repo: string, commitSha: string) {
//     const commit = await octokit.rest.repos.getCommit({
//         owner,
//         repo,
//         ref: commitSha
//     });
//
//     return commit.data.files?.map((file: any) => file.patch).join('\n');
// }


// const Octokit = await import("octokit");


// let Octokit;
// let getCommitDiffs: (owner: string, repo: string, commitSha: string) => Promise<string>;
//
// (async () => {
//     const module = await import('octokit');
//     Octokit = module.Octokit;
//
//     const githubToken = process.env.GITHUB_TOKEN;
//     const apiKey = process.env.ANTHROPIC_API_KEY;
//     const anthropic = new Anthropic({
//         apiKey: process.env.ANTHROPIC_API_KEY,
//     });
//     const octokit = new Octokit({
//         auth: githubToken
//     });
//
//     getCommitDiffs = async function(owner: string, repo: string, commitSha: string) {
//         const commit = await octokit.rest.repos.getCommit({
//             owner,
//             repo,
//             ref: commitSha
//         });
//
//         return commit.data.files?.map((file: any) => file.patch).join('\n') || '';
//     }
// })();
//
// export { getCommitDiffs };

export default class Review {
    private octokit: any;
    private anthropic: any;
    private initialized: Promise<void>;

    constructor() {
        this.initialized = this.init();
    }

    private async init() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const githubToken = process.env.FINE_GRAINED_TOKEN;
        this.anthropic = new Anthropic({
            apiKey: apiKey,
        });
        const { Octokit } = await import('octokit');
        this.octokit = new Octokit({
            auth: githubToken
        });
    }

    public async getCommitDiffs(owner: string, repo: string, commitSha: string) {
        await this.initialized;
        const commit = await this.octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commitSha
        });

        return commit.data.files?.map((file: any) => file.patch).join('\n') || '';
    }

    public async analyzeDiff(diff: string) {
        await this.initialized;
        const response = await this.anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Analyse the following code diff for potential bugs or issues, suggest improvements, and provide a code review.'
                    },
                    {
                        type: 'text',
                        text: diff
                    }
                ]
            }]
        });

        return response.content[0];
    }

    public async analyzeCommit(owner: string, repo: string, commitSha: string) {
        const diff = await this.getCommitDiffs(owner, repo, commitSha);
        const analysis = await this.analyzeDiff(diff);
        return `## Code Review\n\n Analysis for commit ${commitSha}:\n ${analysis.text}`;
    }

    public async createReview(owner: string, repo: string, commitSha: string) {
        const comment = await this.analyzeCommit(owner, repo, commitSha);
        // await this.octokit.rest.repos.createCommitComment({
        await this.octokit.request('POST /repos/{owner}/{repo}/commits/{commit_sha}/comments', {
            owner,
            repo,
            commit_sha: commitSha,
            body: comment
        });
    }

    public async reviewCode(owner: string, repo: string, commitSha: string) {
        await this.createReview(owner, repo, commitSha);
    }
}

const owner = process.env.OWNER;
const repo = process.env.REPO;
const commitSha = process.env.COMMIT_SHA;

const review = new Review();
if (owner && repo && commitSha) {
    review.reviewCode(owner, repo.split('/')[1], commitSha)
        .then(() => {
            console.log('Review created');
        })
        .catch((error) => {
            console.error(error);
        });
} else {
    console.error('Missing required environment variables');
}
