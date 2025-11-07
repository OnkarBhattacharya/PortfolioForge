
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { adminRemoteConfig } from '@/firebase/admin';

// Define a default model as a fallback.
const defaultModel = 'gemini-1.5-pro';

/**
 * Fetches the AI model ID from Firebase Remote Config using the Admin SDK.
 * @returns The model ID string.
 */
async function getModelFromRemoteConfig(): Promise<string> {
  try {
    // Fetch the Remote Config template.
    const template = await adminRemoteConfig.getTemplate();
    const modelParameter = template.parameters['gemini_model_id'];

    // Check if the parameter exists and has a value.
    if (modelParameter && modelParameter.defaultValue && 'value' in modelParameter.defaultValue) {
      const modelId = modelParameter.defaultValue.value;
      if (modelId) {
        console.log(`Successfully fetched model '${modelId}' from Remote Config.`);
        return modelId;
      }
    }
    console.warn('\'gemini_model_id\' not found or is empty in Remote Config.');
  } catch (error) {
    console.error('Error fetching model from Admin Remote Config:', error);
  }

  // Fallback to the default model if any step fails.
  console.log(`Falling back to default model: '${defaultModel}'.`);
  return defaultModel;
}

// Use a function to initialize the AI model on first use.
let aiInstance: any;

async function getAiInstance() {
    if (!aiInstance) {
        const modelName = await getModelFromRemoteConfig();
        aiInstance = genkit({
            plugins: [
                googleAI({ apiVersion: 'v1beta' }),
            ],
            model: `googleai/${modelName}`, // Set the default model for flows.
        });
    }
    return aiInstance;
}

// Export a proxy that will initialize the AI model on first use.
export const ai = new Proxy({}, {
    get: (target, prop) => {
        return async (...args: any[]) => {
            const instance = await getAiInstance();
            return (instance as any)[prop](...args);
        };
    }
}) as any;
