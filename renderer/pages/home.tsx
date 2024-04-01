import Head from "next/head";
import toast from "react-hot-toast";

import { useState, Fragment } from "react";

function Input({ label, value, onChange }) {
  return (
    <div className="flex flex-col items-center">
      <label className="text-xl mb-2 text-purple-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="border-2 border-purple-400 rounded-md px-4 py-2 w-full max-w-md bg-purple-100 focus:outline-none focus:border-purple-600"
      />
    </div>
  );
}

interface Book {
  id: string;
  title: string;
  volumeinfo: string;
  series: string;
  periodical: string;
  author: string;
  year: string;
  edition: string;
  publisher: string;
  city: string;
  pages: string;
  language: string;
  topic: string;
  library: string;
  issue: string;
  identifier: string;
  issn: string;
  asin: string;
  udc: string;
  lbc: string;
  ddc: string;
  lcc: string;
  doi: string;
  googlebookid: string;
  openlibraryid: string;
  commentary: string;
  dpi: string;
  color: string;
  cleaned: string;
  orientation: string;
  paginated: string;
  scanned: string;
  bookmarked: string;
  searchable: string;
  filesize: string;
  extension: string;
  md5: string;
  generic: string;
  visible: string;
  locator: string;
  local: string;
  timeadded: string;
  timelastmodified: string;
  coverurl: string;
  identifierwodash: string;
  tags: string;
  pagesinfile: string;
  descr: string;
  toc: string;
  sha1: string;
  sha256: string;
  crc32: string;
  edonkey: string;
  aich: string;
  tth: string;
  ipfs_cid: string;
  btih: string;
  torrent: string;
}

function Book({
  book,
  index,
  setSelectedBook,
  selectedBook,
}: {
  book: Book;
  index: number;
  setSelectedBook: any;
  selectedBook: any;
}) {
  return (
    <div
      className={`flex flex-col items-center space-y-2 p-4
      ${
        selectedBook.id === book.id
          ? "bg-yellow-200"
          : index % 2 === 0
          ? "bg-yellow-100"
          : "bg-yellow-50"
      }
      `}
    >
      <div className="text-xl text-purple-600">{book.title}</div>
      <div className="text-lg text-blue-600">{book.author}</div>
      <button
        className="bg-blue-500 hover:bg-blue-700 transition-all duration-150 linear text-white py-2 px-4 rounded"
        onClick={() => setSelectedBook(book)}
      >
        Select
      </button>
    </div>
  );
}

export default function HomePage() {
  const [bookName, setBookName] = useState<string>("");
  const [results, setResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<object>({});

  const generateAudiobook = async () => {
    const response = await fetch("/api/generate-audiobook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookName }),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (!response.success) {
      throw new Error("Failed to generate Audiobook");
    }

    return response.data.books;
  };

  const handleGenerate = () => {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const response: Book[] = await generateAudiobook();
        setResults(response);
        resolve("Audiobook generated successfully");
      } catch (error) {
        reject("Failed to generate Audiobook");
      }
    });
  };

  return (
    <Fragment>
      <Head>
        <title>libgen-reader - Turn any Book into an Audiobook</title>
      </Head>
      <div className="text-center p-20 bg-gradient-to-b from-yellow-200 to-yellow-100 space-y-6 antialiased">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-blue-600">libgen-reader</h1>
          <p className="text-xl text-green-600">
            Turn any Book into an Audiobook
          </p>
        </div>
        <div className="mt-8">
          <Input
            label="Book Name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 transition-all duration-150 linear text-white py-2 px-4 rounded"
          onClick={() => {
            toast.promise(handleGenerate(), {
              loading: "Generating Audiobook...",
              success: (data): any => data,
              error: (error): any => {
                return error;
              },
            });
          }}
        >
          Generate Audiobook
        </button>
        {results && (
          <div className="mt-8 space-y-4">
            {results.map((book, index) => (
              <Book
                key={index}
                book={book}
                index={index}
                setSelectedBook={setSelectedBook}
                selectedBook={selectedBook}
              />
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
}
