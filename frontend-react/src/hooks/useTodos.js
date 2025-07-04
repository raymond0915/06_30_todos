import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { todoAPI, todoStats } from "../utils/data"



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

  return { todos: sortedTodos, isLoading, error, stats }
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
          id: Date.now()
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoAPI.deleteTodo,
    onMutate: async (todoId) => {
      await queryClient.cancelQueries(['todos']);
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old = []) =>
        old.filter(todo => todo.id !== todoId)
      )
      return { previousTodos };
    },
    onError: (err, todoId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos']);
    },
  });

}

// todos 상태 값 변경
export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ todoId, isCompleted }) => todoAPI.toggleTodo(todoId, isCompleted),
    onMutate: async ({ todoId, isCompleted }) => {
      await queryClient.cancelQueries(['todos']);
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old = []) =>
        old.map(todo =>
          todo.id === todoId ? { ...todo, isCompleted } : todo
        )
      );
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos']);
    },
  });
}
