// src/telemetry/init.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'nextjs-app',
  }),
  traceExporter: new ConsoleSpanExporter(), // Replace with OTLP exporter for production
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start()
console.log('✅ OpenTelemetry initialized on server');


process.on('SIGTERM', () => {
  sdk.shutdown().then(() => console.log('Telemetry terminated'));
});