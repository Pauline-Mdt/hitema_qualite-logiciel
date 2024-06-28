import Anthropic from "@anthropic-ai/sdk";

class Review {
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
        return `# Code Review\n\n Analysis for commit ${commitSha}:\n\n ${analysis.text}`;
    }

    public async createReview(owner: string, repo: string, commitSha: string) {
        console.log(owner, repo, commitSha);
        const comment = await this.analyzeCommit(owner, repo, commitSha);
        await this.octokit.rest.repos.createCommitComment({
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
