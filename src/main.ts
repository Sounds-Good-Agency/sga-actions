//@ts-nocheck
import * as core from "@actions/core";
import * as github from "@actions/github";
// import { wait } from "./wait";

const ms = core.getInput("milliseconds");
const githubToken = core.getInput("github-token", { required: true });

const runAsync = async () => {
  const octokit = github.getOctokit(githubToken);
  const data = await octokit.paginate(
    "GET /repos/Sounds-Good-Agency/expedo-store/pulls/46/files",
    {
      owner: "Sounds-Good-Agency",
      repo: "expedo-store",
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
    // build this url from the github context
    // let API_PR_URL = `https://api.github.com/repos/Sounds-Good-Agency/expedo-store/pulls/46/files?per_page=${PER_PAGE}`
    let url = `https://api.github.com/repos/${github.context.repo.owner}/${github.context.repo.repo}/pulls/${github.context.payload.pull_request?.number}/files?per_page=100`;
    core.debug(`url: ${url}`);

    let pr_array = await buildArray();
    core.debug(`insideData: ${pr_array}`);

    // let parsedData = await getPaginatedData(staticURL, octokit);
    // core.debug(`parsedData: ${parsedData}`);

    const response = await octokit.request(url);
    core.debug(`response: ${response.data}`);

    // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString());
    // await wait(parseInt(ms, 10));
    // core.debug(new Date().toTimeString());

    // Set outputs for other workflow steps to use
    core.setOutput("time", new Date().toTimeString());
    // core.setOutput("files", parsedData);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
