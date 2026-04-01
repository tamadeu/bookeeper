"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Book } from "@/types/book";
import {
  createBook,
  editBook,
  removeBook,
  type CreateBookInput,
  type UpdateBookInput,
} from "@/actions/books";
import { BookFormModal } from "@/components/BookFormModal";

interface BooksContextValue {
  books: Book[];
  addBook: (input: CreateBookInput) => Promise<void>;
  updateBook: (id: string, input: UpdateBookInput) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  openAddBookModal: () => void;
}

const BooksContext = createContext<BooksContextValue | null>(null);

interface BooksProviderProps {
  children: ReactNode;
  initialBooks: Book[];
}

export function BooksProvider({ children, initialBooks }: BooksProviderProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [modalOpen, setModalOpen] = useState(false);

  const openAddBookModal = useCallback(() => setModalOpen(true), []);

  const addBook = useCallback(async (input: CreateBookInput) => {
    const newBook = await createBook(input);
    setBooks((prev) => [newBook, ...prev]);
  }, []);

  const updateBook = useCallback(async (id: string, input: UpdateBookInput) => {
    await editBook(id, input);
    setBooks((prev) =>
      prev.map((book) => (book.id === id ? { ...book, ...input } : book))
    );
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    await removeBook(id);
    setBooks((prev) => prev.filter((book) => book.id !== id));
  }, []);

  const getBook = useCallback(
    (id: string) => books.find((book) => book.id === id),
    [books]
  );

  return (
    <BooksContext.Provider value={{ books, addBook, updateBook, deleteBook, getBook, openAddBookModal }}>
      {children}
      <BookFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used within BooksProvider");
  return ctx;
}
