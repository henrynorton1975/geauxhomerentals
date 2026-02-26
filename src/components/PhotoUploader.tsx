"use client";

import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { supabase } from "@/lib/supabase";

interface PhotoUploaderProps {
  existingPhotos?: string[];
  onPhotosChange?: (urls: string[]) => void;
}

export interface PhotoUploaderHandle {
  uploadAll: (listingId: string) => Promise<string[]>;
}

interface PhotoItem {
  url: string;
  file?: File;
  uploading?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PhotoUploader = forwardRef<PhotoUploaderHandle, PhotoUploaderProps>(
  function PhotoUploader({ existingPhotos = [], onPhotosChange }, ref) {
    const [photos, setPhotos] = useState<PhotoItem[]>(
      existingPhotos.map((url) => ({ url }))
    );
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photosRef = useRef(photos);
    photosRef.current = photos;

    const notifyParent = useCallback(
      (items: PhotoItem[]) => {
        onPhotosChange?.(items.filter((p) => !p.file).map((p) => p.url));
      },
      [onPhotosChange]
    );

    const addFiles = useCallback((files: FileList | File[]) => {
      const validFiles = Array.from(files).filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );
      if (validFiles.length === 0) return;

      const newPhotos: PhotoItem[] = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
    }, []);

    const removePhoto = useCallback(
      async (index: number) => {
        const photo = photosRef.current[index];

        // If it's a Supabase URL, delete from storage
        if (!photo.file && photo.url.includes("listing-photos")) {
          try {
            const urlPath = new URL(photo.url).pathname;
            const match = urlPath.match(/listing-photos\/(.+)$/);
            if (match) {
              await supabase.storage.from("listing-photos").remove([match[1]]);
            }
          } catch {
            // Continue even if storage delete fails
          }
        }

        if (photo.file) {
          URL.revokeObjectURL(photo.url);
        }

        const updated = photosRef.current.filter((_, i) => i !== index);
        setPhotos(updated);
        notifyParent(updated);
      },
      [notifyParent]
    );

    const movePhoto = useCallback(
      (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= photosRef.current.length) return;
        const updated = [...photosRef.current];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setPhotos(updated);
        notifyParent(updated);
      },
      [notifyParent]
    );

    useImperativeHandle(
      ref,
      () => ({
        uploadAll: async (listingId: string) => {
          const current = photosRef.current;
          const hasPending = current.some((p) => p.file);
          if (!hasPending) {
            return current.map((p) => p.url);
          }

          const updatedPhotos = [...current];
          const uploadedUrls: string[] = [];

          for (let i = 0; i < updatedPhotos.length; i++) {
            const photo = updatedPhotos[i];
            if (!photo.file) {
              uploadedUrls.push(photo.url);
              continue;
            }

            updatedPhotos[i] = { ...photo, uploading: true };
            setPhotos([...updatedPhotos]);

            const ext = photo.file.name.split(".").pop() || "jpg";
            const fileName = `${listingId}/${Date.now()}-${i}.${ext}`;

            const { error } = await supabase.storage
              .from("listing-photos")
              .upload(fileName, photo.file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (error) {
              throw new Error(
                `Failed to upload ${photo.file.name}: ${error.message}`
              );
            }

            const { data: publicUrlData } = supabase.storage
              .from("listing-photos")
              .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;
            uploadedUrls.push(publicUrl);

            URL.revokeObjectURL(photo.url);
            updatedPhotos[i] = { url: publicUrl };
            setPhotos([...updatedPhotos]);
          }

          return uploadedUrls;
        },
      }),
      []
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
      },
      [addFiles]
    );

    return (
      <div>
        <label className="block mb-2">Photos</label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <svg
            className="w-10 h-10 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">
            Drag & drop images here, or{" "}
            <span className="text-blue-600 font-medium">choose files</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">JPG, PNG, or WebP</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {/* Thumbnails */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {photos.map((photo, i) => (
              <div
                key={`${photo.url}-${i}`}
                className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-[4/3]"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${i + 1}`}
                  className={`w-full h-full object-cover ${
                    photo.uploading ? "opacity-50" : ""
                  }`}
                />

                {photo.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Pending badge */}
                {photo.file && !photo.uploading && (
                  <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">
                    Pending
                  </div>
                )}

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-between p-1.5 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePhoto(i, -1);
                        }}
                        className="bg-white/90 text-gray-700 w-7 h-7 rounded flex items-center justify-center text-sm hover:bg-white"
                      >
                        &larr;
                      </button>
                    )}
                    {i < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePhoto(i, 1);
                        }}
                        className="bg-white/90 text-gray-700 w-7 h-7 rounded flex items-center justify-center text-sm hover:bg-white"
                      >
                        &rarr;
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(i);
                    }}
                    className="bg-red-500/90 text-white w-7 h-7 rounded flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>

                {/* First photo label */}
                {i === 0 && (
                  <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default PhotoUploader;
