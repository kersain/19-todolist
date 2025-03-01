import { BaseResponse } from "common/types"
import { baseApi } from "../../../app/baseApi"
import { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"

export const PAGE_SIZE = 4

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<GetTasksResponse, {todolistId: string, args: {page: number}}>({
      query: ({todolistId, args}) => {
        return {
          url: `todo-lists/${todolistId}/tasks`,
          params: {...args, count: PAGE_SIZE}
        }
      },
      providesTags: (result, error,{ todolistId}) => (result ? [ {type: 'Task', id: todolistId}] : ['Task'])
        
    }),
    addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
      query: ({ todolistId, title }) => {
        return {
          method: "POST",
          url: `todo-lists/${todolistId}/tasks`,
          body: {
            title,
          },
        }
      },
      invalidatesTags: (result, error, {todolistId}) => [{type: 'Task', id: todolistId}],
    }),
    removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
      query: ({ todolistId, taskId }) => {
        return {
          method: "DELETE",
          url: `todo-lists/${todolistId}/tasks/${taskId}`,
        }
      },
      invalidatesTags: (result, error, {todolistId}) => [{type: 'Task', id: todolistId}],
    }),
    updateTask: build.mutation<
      BaseResponse<{ item: DomainTask }>,
      { todolistId: string; taskId: string; model: UpdateTaskModel }
    >({
      query: ({ todolistId, taskId, model }) => {
        return {
          method: "PUT",
          url: `todo-lists/${todolistId}/tasks/${taskId}`,
          body: model,
        }
      },
      async onQueryStarted({ todolistId, taskId, model }, {dispatch, queryFulfilled, getState}) {

        const cachedArgsForQuery = tasksApi.util.selectCachedArgsForQuery(getState(), 'getTasks')

        let patchResaults: any[] = []

        cachedArgsForQuery.forEach(({args}) => {
          patchResaults.push(
            dispatch(
              tasksApi.util.updateQueryData('getTasks', {todolistId, args: {page: args.page}}, state => {
                const task = state.items.find(task => task.id === taskId)
                if (task) {
                  task.status = model.status
                }
              })
            )
          )
        })
          try {
            await queryFulfilled
          } catch (e) {
            patchResaults.forEach(patchResault => {
              patchResault.undo()
            })
          }
      },
      invalidatesTags: (result, error, {todolistId}) => [{type: 'Task', id: todolistId}],
    }),
  }),
})

export const { useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation } = tasksApi


