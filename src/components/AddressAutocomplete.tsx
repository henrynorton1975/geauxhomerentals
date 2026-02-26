"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
  }
}

import { useEffect, useRef, useCallback } from "react";

interface AddressAutocompleteProps {
  name?: string;
  value?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  onPlaceSelect?: (address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  }) => void;
}

export default function AddressAutocomplete({
  name,
  value,
  required,
  onChange,
  onPlaceSelect,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);
  onPlaceSelectRef.current = onPlaceSelect;
  onChangeRef.current = onChange;

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || autocompleteRef.current) return;
    if (typeof window.google === "undefined" || !window.google?.maps?.places) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      types: ["address"],
      fields: ["address_components"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.address_components) return;

      let street_number = "";
      let route = "";
      let city = "";
      let state = "";
      let zip = "";

      for (const comp of place.address_components) {
        const type = comp.types[0];
        if (type === "street_number") street_number = comp.long_name;
        else if (type === "route") route = comp.short_name;
        else if (type === "locality") city = comp.long_name;
        else if (type === "administrative_area_level_1") state = comp.short_name;
        else if (type === "postal_code") zip = comp.long_name;
      }

      const street = `${street_number} ${route}`.trim();

      if (inputRef.current) {
        inputRef.current.value = street;
      }

      onChangeRef.current?.(street);
      onPlaceSelectRef.current?.({ street, city, state, zip });
    });

    autocompleteRef.current = ac;
  }, []);

  useEffect(() => {
    // Try immediately in case script is already loaded
    initAutocomplete();

    // Also poll briefly for the script to load (Google script loads async)
    if (!autocompleteRef.current) {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          initAutocomplete();
          clearInterval(interval);
        }
      }, 500);
      // Stop polling after 10 seconds
      const timeout = setTimeout(() => clearInterval(interval), 10000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [initAutocomplete]);

  return (
    <input
      ref={inputRef}
      type="text"
      name={name}
      defaultValue={value}
      required={required}
      onChange={(e) => onChange?.(e.target.value)}
      autoComplete="off"
    />
  );
}
