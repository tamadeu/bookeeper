"use client";

import { useState } from "react";
import { BookList } from "@/components/BookList";
import { BookFormModal } from "@/components/BookFormModal";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <BookList onAddBook={() => setModalOpen(true)} />
      <BookFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
