import { Suite, GitHubContentsResponse, ModelData, ModelResult } from './types';

const repo: string = process.env.GITHUB_REPOSITORY!;

async function fetchFile<T>(path: string): Promise<T> {
  const url = `https://raw.githubusercontent.com/${repo}/main/${path}`;
  console.log(url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchSuite(): Promise<Suite> {
  return fetchFile<Suite>('results/suite.json');
}

interface File {
  type: string;
}

export async function fetchModelList(): Promise<string[]> {
  const url = `https://api.github.com/repos/${repo}/contents/results`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  const contents: GitHubContentsResponse = await response.json();
  const folders = contents.filter((file: File) => file.type === 'dir');
  return folders.map((folder) => folder.name);
}

export async function fetchModelData(name: string): Promise<ModelData> {
  const path = `results/${name}/model.result.json`;
  const result = await fetchFile<ModelResult>(path);
  const data: ModelData = {
    ...result,
    source: `https://github.com/${repo}/blob/main/results/${name}/model.py`,
  };
  return data;
}
