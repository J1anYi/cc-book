import api from './api';
import { Borrowing } from '../types';

interface BorrowingQuery {
  skip?: number;
  limit?: number;
  status_filter?: string;
}

export const borrowingsService = {
  async getBorrowings(params?: BorrowingQuery): Promise<Borrowing[]> {
    const response = await api.get<Borrowing[]>('/borrowings', { params });
    return response.data;
  },

  async getMyBorrowings(params?: BorrowingQuery): Promise<Borrowing[]> {
    const response = await api.get<Borrowing[]>('/borrowings/my', { params });
    return response.data;
  },

  async createBorrowing(data: {
    book_id: number;
    due_date: string;
    user_id?: number;
  }): Promise<Borrowing> {
    const response = await api.post<Borrowing>('/borrowings', data);
    return response.data;
  },

  async returnBook(id: number): Promise<Borrowing> {
    const response = await api.put<Borrowing>(`/borrowings/${id}/return`);
    return response.data;
  },

  async renewBorrowing(id: number, newDueDate: string): Promise<Borrowing> {
    const response = await api.put<Borrowing>(`/borrowings/${id}/renew`, {
      new_due_date: newDueDate,
    });
    return response.data;
  },
};
