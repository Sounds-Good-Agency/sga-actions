//@ts-nocheck
import * as core from "@actions/core";
import * as github from "@actions/github";

const githubToken = core.getInput("github-token", { required: true });

const runAsync = async () => {
  const octokit = github.getOctokit(githubToken);
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const pull_number = github.context.payload.pull_request?.number;
  const data = await octokit.paginate(
    `GET /repos/${owner}/${repo}/pulls/${pull_number}/files`,
    {
      owner: owner,
      repo: repo,
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  return data;
};

const buildArray = async () => {
  let insideData = [];
  const paginatedData = await runAsync();

  for (let i = 0; i < paginatedData.length; i++) {
    insideData.push(paginatedData[i].filename);
  }
  return insideData;
};

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    let url = `https://api.github.com/repos/${github.context.repo.owner}/${github.context.repo.repo}/pulls/${github.context.payload.pull_request?.number}/files?per_page=100`;
    core.debug(`url: ${url}`);

    let pr_array = await buildArray();
    core.debug(`insideData: ${pr_array}`);
    let output = "";
    for (let i = 0; i < pr_array.length; i++) {
      output += pr_array[i] + " ";
    }
    core.setOutput("files", output);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
