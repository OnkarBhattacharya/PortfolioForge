
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import { logger } from './logger';

function sendToAnalytics(metric: any) {
  logger.info('Web Vitals Metric', { metric });
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
