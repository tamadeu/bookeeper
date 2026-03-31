"use client";

import Link from "next/link";
import { useBooks } from "@/context/BooksContext";
import { Book } from "@/types/book";
import { STATUS_LABELS } from "@/lib/constants";
import { StarRating } from "@/components/StarRating";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  BookOpen,
  ArrowLeft,
  TrendingUp,
  Clock,
  Star,
  BookMarked,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function avgReadingDays(books: Book[]): number | null {
  const finished = books.filter((b) => b.startedAt && b.finishedAt);
  if (finished.length === 0) return null;
  const total = finished.reduce((sum, b) => {
    const start = new Date(b.startedAt!).getTime();
    const end = new Date(b.finishedAt!).getTime();
    return sum + (end - start) / (1000 * 60 * 60 * 24);
  }, 0);
  return Math.round(total / finished.length);
}

function booksByMonth(books: Book[]): { month: string; livros: number }[] {
  const finished = books.filter((b) => b.finishedAt);
  const map: Record<string, number> = {};
  finished.forEach((b) => {
    const d = new Date(b.finishedAt! + "T00:00:00");
    const key = d.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });
    map[key] = (map[key] ?? 0) + 1;
  });
  // Sort chronologically
  const sorted = finished
    .map((b) => b.finishedAt!)
    .sort()
    .map((d) => {
      const date = new Date(d + "T00:00:00");
      return date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });
    });
  const unique = [...new Set(sorted)];
  return unique.map((month) => ({ month, livros: map[month] }));
}

function booksByGenre(books: Book[]): { genre: string; total: number }[] {
  const map: Record<string, number> = {};
  books.forEach((b) => {
    map[b.genre] = (map[b.genre] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([genre, total]) => ({ genre, total }))
    .sort((a, b) => b.total - a.total);
}

function booksByAuthor(
  books: Book[],
  limit = 8
): { author: string; total: number }[] {
  const map: Record<string, number> = {};
  books.forEach((b) => {
    map[b.author] = (map[b.author] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([author, total]) => ({ author, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

function ratingDistribution(books: Book[]): { stars: string; qtd: number }[] {
  const rated = books.filter((b) => b.rating !== null);
  const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rated.forEach((b) => {
    map[b.rating!] = (map[b.rating!] ?? 0) + 1;
  });
  return [1, 2, 3, 4, 5].map((s) => ({
    stars: "★".repeat(s),
    qtd: map[s],
  }));
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const GENRE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f97316",
  "#14b8a6",
  "#ef4444",
  "#a855f7",
];

const STATUS_PIE_COLORS: Record<string, string> = {
  read: "#10b981",
  reading: "#3b82f6",
  want_to_read: "#94a3b8",
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { books } = useBooks();

  const readBooks = books.filter((b) => b.status === "read");
  const readingBooks = books.filter((b) => b.status === "reading");
  const wantBooks = books.filter((b) => b.status === "want_to_read");
  const ratedBooks = books.filter((b) => b.rating !== null);

  const avgRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((s, b) => s + b.rating!, 0) / ratedBooks.length
      : null;

  const avgDays = avgReadingDays(books);
  const monthlyData = booksByMonth(books);
  const genreData = booksByGenre(books);
  const authorData = booksByAuthor(books);
  const ratingData = ratingDistribution(books);

  const pieData = [
    { name: STATUS_LABELS.read, value: readBooks.length, key: "read" },
    { name: STATUS_LABELS.reading, value: readingBooks.length, key: "reading" },
    {
      name: STATUS_LABELS.want_to_read,
      value: wantBooks.length,
      key: "want_to_read",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Biblioteca
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stat cards */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Visão geral
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              label="Total na biblioteca"
              value={books.length}
              color="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              icon={BookMarked}
              label="Livros lidos"
              value={readBooks.length}
              sub={
                books.length > 0
                  ? `${Math.round((readBooks.length / books.length) * 100)}% do total`
                  : undefined
              }
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon={Clock}
              label="Tempo médio de leitura"
              value={avgDays !== null ? `${avgDays} dias` : "—"}
              sub="por livro concluído"
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={Star}
              label="Avaliação média"
              value={avgRating !== null ? avgRating.toFixed(1) : "—"}
              sub={
                ratedBooks.length > 0
                  ? `${ratedBooks.length} livro${ratedBooks.length > 1 ? "s" : ""} avaliado${ratedBooks.length > 1 ? "s" : ""}`
                  : "nenhum avaliado"
              }
              color="bg-amber-50 text-amber-600"
            />
          </div>
        </section>

        {/* Status distribution + Rating distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie – Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Distribuição por status
            </h2>
            {books.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent != null && percent > 0.05
                        ? `${name} (${(percent * 100).toFixed(0)}%)`
                        : ""
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={STATUS_PIE_COLORS[entry.key]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} livros`]} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar – Rating distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">
              Distribuição de avaliações
            </h2>
            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="text-xs text-slate-400">
                  média {avgRating.toFixed(1)}
                </span>
              </div>
            )}
            {ratedBooks.length === 0 ? (
              <EmptyChart label="Nenhum livro avaliado ainda" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={ratingData}
                  margin={{ top: 0, right: 0, left: -24, bottom: 0 }}
                >
                  <XAxis
                    dataKey="stars"
                    tick={{ fontSize: 12, fill: "#f59e0b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(v) => [`${v} livro${Number(v) !== 1 ? "s" : ""}`, "Qtd"]}
                  />
                  <Bar dataKey="qtd" radius={[4, 4, 0, 0]} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Books read by month */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Livros concluídos ao longo do tempo
          </h2>
          {monthlyData.length === 0 ? (
            <EmptyChart label="Nenhum livro concluído ainda" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={monthlyData}
                margin={{ top: 0, right: 0, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(v) => [`${v} livro${Number(v) !== 1 ? "s" : ""}`, "Concluídos"]}
                />
                <Bar dataKey="livros" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Books by genre */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Livros por gênero
          </h2>
          {genreData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2.5">
              {genreData.map((item, i) => (
                <div key={item.genre} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-36 shrink-0 truncate">
                    {item.genre}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.total / genreData[0].total) * 100}%`,
                        backgroundColor:
                          GENRE_COLORS[i % GENRE_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-6 text-right shrink-0">
                    {item.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Authors */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Autores mais lidos
          </h2>
          {authorData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2.5">
              {authorData.map((item, i) => (
                <div key={item.author} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-40 shrink-0 truncate">
                    {item.author}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.total / authorData[0].total) * 100}%`,
                        backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-6 text-right shrink-0">
                    {item.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reads */}
        {readBooks.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Livros lidos recentemente
            </h2>
            <div className="divide-y divide-slate-100">
              {readBooks
                .filter((b) => b.finishedAt)
                .sort((a, b) => (b.finishedAt! > a.finishedAt! ? 1 : -1))
                .slice(0, 5)
                .map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {book.title}
                      </p>
                      <p className="text-xs text-slate-400">{book.author}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {book.rating !== null && (
                        <StarRating value={book.rating} readonly size="sm" />
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(book.finishedAt! + "T00:00:00").toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyChart({ label = "Sem dados suficientes" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
      {label}
    </div>
  );
}
