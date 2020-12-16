/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'stub-azure-function-context' {
  export function runStubFunctionFromBindings(
    func: any,
    bindingDefinitions: any[],
    amendContext?: any,
    now?: Date,
  ): any

  export function createHttpTrigger(
    method: string,
    url: string,
    headers: any,
    params: any,
    body: any,
    query: any,
    originalUrl?: string,
    rawBody?: any,
  ): any

  export function createTimerTrigger(
    now?: any,
    interval?: number,
    IsPastDue?: boolean,
    AdjustForDST?: boolean,
  ): any
}
