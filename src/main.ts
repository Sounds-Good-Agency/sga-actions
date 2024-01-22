import * as core from "@actions/core";
import * as github from "@actions/github";
import { testtasklog } from "./task/test";
import { build_pr_array } from "./task/build_pr_array";

export async function run(): Promise<void> {
  try {
    await taskRunner(core.getInput("task"));
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}

async function taskRunner(input: string): Promise<void> {
  try {
    switch (input) {
      case "load":
        await testtasklog();
        break;
      case "build_pr_array":
        await build_pr_array();
        break;
      default:
        console.log("no task found");
        break;
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
