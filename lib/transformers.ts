export async function getPipeline(task: string, model: string) {
  const mod: any = await import('@xenova/transformers');
  const { pipeline, env } = mod;
  // Configure for browser (WASM) backend
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/';
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.backend = 'wasm';
  return pipeline(task as any, model);
}
