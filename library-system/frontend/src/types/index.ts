export interface User {
  id: number;
  username: string;
  name: string | null;
  phone: string | null;
  role: 'reader' | 'librarian';
  created_at: string;
}

export interface Book {
  id: number;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  category: string | null;
  total_copies: number;
  available_copies: number;
  location: string | null;
  cover_image: string | null;
  created_at: string;
}

export interface Borrowing {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  operator_id: number | null;
  created_at: string;
  book_title: string | null;
  book_author: string | null;
  user_name: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
