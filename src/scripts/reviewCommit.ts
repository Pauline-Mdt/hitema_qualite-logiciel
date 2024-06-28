import ReviewCommit from "../ReviewCommit";

const owner = process.env.OWNER;
const repo = process.env.REPO;
const commitSha = process.env.COMMIT_SHA;

const review = new ReviewCommit();
if (owner && repo && commitSha) {
    review.reviewCode(owner, repo.split('/')[1], commitSha)
        .then((commitHtmlUrl) => {
            console.log('Review created for commit', commitHtmlUrl);
        })
        .catch((error) => {
            console.error(error);
        });
} else {
    console.error('Missing required environment variables');
}