//@ts-nocheck
import * as core from "@actions/core";
import * as github from "@actions/github";
import { wait } from "./wait";

let staticURL =
  "https://api.github.com/repos/Sounds-Good-Agency/expedo-store/pulls/46/files?per_page=100";
let arrayOfFilename: any = [];

async function getPaginatedData(url, octokit) {
  const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
  let pagesRemaining = true;
  let data = [];

  while (pagesRemaining) {
    const response = await octokit.request(`GET ${url}`, {
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const parsedData = parseData(response.data);
    data = [...data, ...parsedData];

    const linkHeader = response.headers.link as any;

    let pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);

    if (pagesRemaining) {
      url = linkHeader.match(nextPattern)[0];
    }
  }

  return data;
}

function parseData(data: any) {
  for (let i = 0; i < data.length; i++) {
    arrayOfFilename.push(data[i].filename);
  }
  return arrayOfFilename;
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms = core.getInput("milliseconds");
    const githubToken = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(githubToken);

    let parsedData = await getPaginatedData(staticURL, octokit);
    core.debug(`parsedData: ${parsedData}`);

    // build this url from the github context
    // let API_PR_URL = `https://api.github.com/repos/Sounds-Good-Agency/expedo-store/pulls/46/files?per_page=${PER_PAGE}`
    let url = `https://api.github.com/repos/${github.context.repo.owner}/${github.context.repo.repo}/pulls/${github.context.payload.pull_request?.number}/files?per_page=100`;
    core.debug(`url: ${url}`);
    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString());
    await wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());

    // Set outputs for other workflow steps to use
    core.setOutput("time", new Date().toTimeString());
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
