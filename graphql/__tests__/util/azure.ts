/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AzureFunction } from '@azure/functions'
import {
  createHttpTrigger,
  runStubFunctionFromBindings,
} from 'stub-azure-function-context'

function graphQlHttpTriggerFactory(query: string): any {
  const body = { query }

  return createHttpTrigger('POST', 'http://example.com', {}, {}, body, {})
}

export async function invokeFunction(
  functionUnderTest: AzureFunction,
  functionConfig: any,
  query: string,
): Promise<any> {
  const httpTrigger = graphQlHttpTriggerFactory(query)

  const bindings = functionConfig.bindings
  bindings.forEach((binding: any) => {
    if (binding.type === 'httpTrigger') {
      binding.data = httpTrigger
    }
  })

  return runStubFunctionFromBindings(functionUnderTest, bindings)
}
