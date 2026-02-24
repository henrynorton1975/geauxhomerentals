"use client";

import { useState } from "react";

export default function PhotoGallery({
  photos,
  address,
}: {
  photos: string[];
  address: string;
}) {
  const [current, setCurrent] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
          </svg>
          <p className="mt-2">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden bg-gray-900">
      <img
        src={photos[current]}
        alt={`${address} - Photo ${current + 1}`}
        className="w-full h-full object-cover"
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(current === 0 ? photos.length - 1 : current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 text-xl"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent(current === photos.length - 1 ? 0 : current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 text-xl"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {current + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
