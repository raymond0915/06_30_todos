import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { todoAPI } from "../utils/data"
import todoStats from "../components/ui/TodoStats";


// 전체 Todos 요청
export const useTodos = (filter = 'all') => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: todoAPI.fetchTodos,
    staleTime: 5 * 60 * 1000 // 5분 동안 fresh 상태 유지
  })

  const filteredTodos = todoStats.filteredTodos(todoAPI, filter);
  const sortedTodos = todoStats.sortTodos(filteredTodos);
  const stats = todoStats.calculateStats(todos);

  return { todos: sortedTodos, isLoading, error, refetch }
}

// todos 추가
export const useAddTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: todoAPI.addTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries(['todos']);
      const previousTodos = queryClient.getQueriesData(['todos']);

      queryClient.setQueryData(['todos'], (old = []) => [
        ...old,
        {
          ...newTodo,
          id: initialTodos.reduce((maxId, todos) =>
            Math.max(maxId, todos.id) + 1, 0),
        }])
      return { previousTodos }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos']);
    }
  })


}
// todos 삭제
export const useDeleteTodo = () => {

}
// todos 상태 값 변경
export const useUpdateTodo = () => {

}
