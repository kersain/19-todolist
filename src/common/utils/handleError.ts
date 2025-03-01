import {
    BaseQueryApi,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
    QueryReturnValue,
  } from '@reduxjs/toolkit/query/react'
  import { setAppError } from '../../app/appSlice'
  import { ResultCode } from 'common/enums'

  function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
      typeof error === 'object' &&
      error != null &&
      'message' in error &&
      typeof (error as any).message === 'string'
    )
  }
   
  export const handleError = (
    api: BaseQueryApi,
    result: QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
  ) => {
    let error = 'Some error occurred'
   
    if (result.error) {
      switch (result.error.status) {
        case 'FETCH_ERROR':
        case 'PARSING_ERROR':
        case 'CUSTOM_ERROR':
          error = result.error.error
          break
   
        case 403:
          error = '403 Forbidden Error. Check API-KEY'
          break
   
        case 400:
        case 500:
          if (isErrorWithMessage(result.error)) {
            error = result.error.message
          } else {
            error = JSON.stringify(result.error.data)
          }
          break
   
        default:
          error = JSON.stringify(result.error)
          break
      }
      api.dispatch(setAppError({ error }))
    }
   
    if ((result.data as { resultCode: ResultCode }).resultCode === ResultCode.Error) {
      const messages = (result.data as { messages: string[] }).messages
      error = messages.length ? messages[0] : error
      api.dispatch(setAppError({ error }))
    }
  }