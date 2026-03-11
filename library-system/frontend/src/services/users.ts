import api from './api';
import { User } from '../types';

interface UserQuery {
  skip?: number;
  limit?: number;
  role?: string;
}

export const usersService = {
  async getUsers(params?: UserQuery): Promise<User[]> {
    const response = await api.get<User[]>('/users', { params });
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateUser(id: number, data: Partial<User> & { password?: string }): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
