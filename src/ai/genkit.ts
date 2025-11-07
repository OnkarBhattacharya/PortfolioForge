
import { geminiPro, geminiProVision } from '@genkit-ai/google-genai';
import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { getRemoteConfig } from 'firebase-admin/remote-config';
import { adminApp } from '@/lib/firebase/admin';

configureGenkit({
  plugins: [firebase()],
  enableTracingAndMetrics: true,
});

async function getModelIdFromRemoteConfig(): Promise<string> {
  try {
    const remoteConfig = getRemoteConfig(adminApp);
    const template = await remoteConfig.getTemplate();
    if (template.parameters.gemini_model_id) {
      const modelId = template.parameters.gemini_model_id.defaultValue?.value;
      if (modelId) {
        return modelId;
      }
    }
    console.warn('gemini_model_id not found or is empty in Remote Config.');
  } catch (error) {
    console.error('Error fetching model from Admin Remote Config:', error);
  }
  return 'gemini-pro';
}

export async function getAiInstance() {
  const modelId = await getModelIdFromRemoteConfig();
  if (modelId === 'gemini-pro') {
    return geminiPro;
  }
  return geminiProVision;
}
