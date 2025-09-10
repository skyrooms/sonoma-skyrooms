import OpenAI from 'openai';
import { Meteor } from 'meteor/meteor';
import type { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/chat';

let client: OpenAI;
let model: string;

export function initSonoma() {
    const apiKey = Meteor.settings.private?.openrouter_api_key;
    
    if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please check your settings.json file.');
    }
    model = Meteor.settings.private?.model;
    if (!model) {
    throw new Error('OpenRouter Model not selected. Please check your settings.json file.');
    }

    // https://openrouter.ai/openrouter/sonoma-sky-alpha/api
    client = new OpenAI({ 
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1'
    });
}

export async function getChatCompletion(messages: ChatCompletionMessageParam[]): Promise<ChatCompletion> {
  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages,
    });
    return completion;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw new Meteor.Error('or-api-error', 'Failed to get a chat completion from OpenRouter.');
  }
}