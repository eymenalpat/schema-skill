import { AzureOpenAI } from 'openai';
import { loadConfig } from '../utils/config.js';

let client: AzureOpenAI | null = null;

export function getAIClient(): AzureOpenAI {
  if (!client) {
    const config = loadConfig();
    client = new AzureOpenAI({
      endpoint: config.azureOpenAiEndpoint,
      apiKey: config.azureOpenAiApiKey,
      apiVersion: config.azureOpenAiApiVersion,
    });
  }
  return client;
}

export function getDeploymentName(): string {
  const config = loadConfig();
  return config.azureOpenAiDeployment;
}
