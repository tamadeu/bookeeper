"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types/book";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { StarRating } from "./StarRating";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
        {/* Cover */}
        <div className="relative h-52 bg-slate-100 overflow-hidden">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Capa de ${book.title}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="w-12 h-12 text-slate-300" />
            </div>
          )}
          {/* Status badge */}
          <span
            className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}
          >
            {STATUS_LABELS[book.status]}
          </span>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 mb-0.5 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 mb-2">{book.author}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {book.genre}
            </span>
            {book.rating !== null && (
              <StarRating value={book.rating} readonly size="sm" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
