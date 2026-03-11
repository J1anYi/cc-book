import api from './api';
import { Book } from '../types';

interface BookQuery {
  skip?: number;
  limit?: number;
  title?: string;
  author?: string;
  category?: string;
}

interface UploadCoverResponse {
  message: string;
  cover_image: string;
}

export const booksService = {
  async getBooks(params?: BookQuery): Promise<Book[]> {
    const response = await api.get<Book[]>('/books', { params });
    return response.data;
  },

  async getBook(id: number): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },

  async createBook(data: Partial<Book>): Promise<Book> {
    const response = await api.post<Book>('/books', data);
    return response.data;
  },

  async updateBook(id: number, data: Partial<Book>): Promise<Book> {
    const response = await api.put<Book>(`/books/${id}`, data);
    return response.data;
  },

  async deleteBook(id: number): Promise<void> {
    await api.delete(`/books/${id}`);
  },

  async uploadCover(bookId: number, file: File): Promise<UploadCoverResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<UploadCoverResponse>(`/books/${bookId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
