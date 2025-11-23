import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type Ref,
} from "react";
import styles from "./searchbar.module.css";
import { icon_search } from "#frontend/assets/images";
import { autocompleteOptions } from "#frontend/shared/api/query-options/autocomplete";
import { useDebouncedValue } from "#frontend/shared/hooks/use-debounced-value";
import { Button } from "#frontend/shared/primitives/button";
import { Image } from "#frontend/shared/primitives/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#frontend/shared/primitives/popover";
import { useLocationStore } from "#frontend/shared/store/location";

import {
  animate,
  linear,
  throttledDraw,
} from "#frontend/shared/utils/animation";
import { capitalizeFirstLetter } from "#frontend/shared/utils/string";

type SearchBarProps = {
  handleBookmark: (location: string) => void;
  ref: Ref<(bookmark: string) => void>;
};

export function SearchBar({ handleBookmark, ref }: SearchBarProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchInputError, setSearchInputError] = useState("");
  const queryClient = useQueryClient();
  const setLocationData = useLocationStore((state) => state.setLocationData);
  const debouncedSearchInput = useDebouncedValue(searchInput);
  const { data, fetchStatus } = useQuery({
    ...autocompleteOptions.getLocations(debouncedSearchInput),
    select: (data) => {
      return data.results;
    },
  });
  const searchBarPlaceholderRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => {
    return (bookmark: string) => {
      setSearchInput(bookmark);
    };
  });

  useEffect(() => {
    let currentIndex = 0;
    const placeholder = searchBarPlaceholderRef.current;
    const placeholderStrings = [
      "The place can be any city or country...",
      "Search for a place...",
    ];

    if (placeholder === null) {
      return;
    }

    const throttledDrawFn = throttledDraw((progress) => {
      placeholder.placeholder = (
        placeholderStrings[currentIndex] as string
      ).slice(
        0,
        Math.ceil(
          progress * (placeholderStrings[currentIndex] as string).length,
        ),
      );

      if (progress === 1) {
        currentIndex = (currentIndex + 1) % placeholderStrings.length;
      }
    }, 30);

    const RAF_object = animate({
      draw: throttledDrawFn,
      duration: 2000,
      timing: linear,
      delay: 1500,
      isInfinite: true,
    });

    if (searchInput) {
      RAF_object.pause();
    }

    return () => {
      RAF_object.cancel();
    };
  }, [searchInput]);

  useEffect(() => {
    if (fetchStatus !== "fetching") {
      setIsSearching(false);
    }
  }, [fetchStatus]);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.currentTarget.value);
    setIsSearching(true);
    setIsPopoverOpen(true);
    setSearchInputError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPopoverOpen(false);

    if (!searchInput) {
      setSearchInputError("Please provide a location name");
      return;
    }

    const data = await queryClient.fetchQuery({
      ...autocompleteOptions.getLocations(searchInput),
    });

    const latitude = data.results?.[0]?.latitude ?? 0;
    const longitude = data.results?.[0]?.longitude ?? 0;

    setLocationData(latitude, longitude);
    handleBookmark(searchInput);
  };

  const handleAutoCompleteSelect = (
    name: string,
    country: string | undefined,
  ) => {
    setSearchInput(`${name}, ${country}`);
    setIsPopoverOpen(false);
  };

  return (
    <form className={styles.layout} onSubmit={handleSubmit}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            className={styles["search-input"]}
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            <Image src={icon_search} alt="search icon"></Image>
            <input
              type="text"
              placeholder="Search for a place..."
              name="location"
              value={searchInput}
              onChange={handleInput}
              ref={searchBarPlaceholderRef}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          {isSearching ? (
            <p className={styles["search-loader"]}>Searching</p>
          ) : !data ? (
            <p>No match found</p>
          ) : (
            data?.map(({ id, name, country }) => (
              <li key={id} className={styles["search-item"]}>
                <Button
                  onClick={() => handleAutoCompleteSelect(name, country)}
                  variant="search-item"
                >
                  {`${capitalizeFirstLetter(name)}, ${country}`}
                </Button>
              </li>
            ))
          )}
        </PopoverContent>
      </Popover>

      {searchInputError && <p className={styles.error}>{searchInputError}</p>}
      <Button type="submit" variant="search">
        Search
      </Button>
    </form>
  );
}
