import { BaseResponse } from "common/types"
import { baseApi } from "../../../app/baseApi"
import { Todolist } from "./todolistsApi.types"
import { DomainTodolist } from "../lib/types/types"

export const todolistsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodolists: build.query<DomainTodolist[], void>({
      query: () => "todo-lists",
      transformResponse(todolists: Todolist[]): DomainTodolist[] {
        return todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
      },
      providesTags: ["Todolist"],
    }),
    addTodolist: build.mutation<BaseResponse<{ item: Todolist }>, string>({
      query: (title) => {
        return {
          url: "todo-lists",
          method: "POST",
          body: { title },
        }
      },
      invalidatesTags: ["Todolist"],
    }),
    removeTodolist: build.mutation<BaseResponse, string>({
      query: (id) => {
        return {
          method: "DELETE",
          url: `todo-lists/${id}`,
        }
      },
      async onQueryStarted(todolistId, {dispatch, queryFulfilled}) {
        const patchResault = dispatch(
          todolistsApi.util.updateQueryData('getTodolists', undefined, state => {
            const index = state.findIndex(todo => todo.id === todolistId)
            if (index !== -1) {
              state.splice(index, 1)
            }
          })
        )
        try {
          await queryFulfilled
            patchResault.undo()
        } catch (e) {
          patchResault.undo()
        }
      },
      invalidatesTags: ["Todolist"],
    }),
    updateTodolistTitle: build.mutation<BaseResponse, { id: string; title: string }>({
      query: ({ id, title }) => {
        return {
          method: "PUT",
          url: `todo-lists/${id}`,
          body: {
            title,
          },
        }
      },
      invalidatesTags: ["Todolist"],
    }),
  }),
})

export const {
  useGetTodolistsQuery,
  useAddTodolistMutation,
  useRemoveTodolistMutation,
  useUpdateTodolistTitleMutation,
} = todolistsApi


