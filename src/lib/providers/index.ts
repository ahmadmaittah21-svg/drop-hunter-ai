import type { ProductDataProvider } from "./productDataProvider";
import { AliExpressProvider } from "./aliexpressProvider";
import { GenericProvider } from "./genericProvider";
import { DemoProvider } from "./demoProvider";

/**
 * Central provider registry. Order matters: providers are tried in
 * order and the first one whose `supports(url)` returns true wins.
 * DemoProvider is always last because it supports every URL (fallback).
 *
 * To add a new real-data provider: implement ProductDataProvider,
 * import it here, and insert it before DemoProvider in the array.
 */
export function getProviders(demoMode: boolean): ProductDataProvider[] {
  if (demoMode) return [new DemoProvider()];
  return [new AliExpressProvider(), new GenericProvider(), new DemoProvider()];
}

export * from "./productDataProvider";
