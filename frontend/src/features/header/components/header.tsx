import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useShallow } from "zustand/shallow";
import styles from "./header.module.css";
import {
  logo,
  icon_units,
  icon_dropdown,
  icon_close,
} from "#frontend/assets/images";
import { SearchBar } from "#frontend/features/header/components/searchbar";
import { Logger } from "#frontend/shared/app/logging";
import { Button } from "#frontend/shared/primitives/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#frontend/shared/primitives/dropdown";
import { Image } from "#frontend/shared/primitives/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#frontend/shared/primitives/popover";
import {
  useCurrentUnits,
  useCurrentSystem,
  useUnitStore,
} from "#frontend/shared/store/unit";

export function Header() {
  const [bookmarkList, setBookmarkList] = useState<Set<string>>(() => {
    const bookmarks = localStorage.getItem("bookmark");

    if (bookmarks === null) {
      return new Set();
    }

    const parsedBookmarks = JSON.parse(bookmarks);

    return Array.isArray(parsedBookmarks)
      ? new Set(parsedBookmarks)
      : new Set();
  });
  const currentSystem = useCurrentSystem();
  const currentUnits = useCurrentUnits();
  const {
    setCurrentSystem,
    setCurrentUnits,
    setImperialUnits,
    setMetricUnits,
  } = useUnitStore(
    useShallow((state) => {
      const { currentUnits: _1, currentSystem: _2, ...rest } = state;

      return rest;
    }),
  );
  const searchBarRef = useRef<(bookmark: string) => void>(null);

  useEffect(() => {}, []);

  useEffect(() => {
    localStorage.setItem("bookmark", JSON.stringify([...bookmarkList]));
  }, [bookmarkList]);

  const handleBookmark = (location: string) => {
    setBookmarkList((prev) => new Set(prev).add(location));
  };

  const handleChooseBookmark = (bookmark: string) => {
    if (!searchBarRef.current) {
      return;
    }

    searchBarRef.current(bookmark);
  };

  const handleDeleteBookmark = (location: string) => {
    setBookmarkList((prev) => {
      prev.delete(location);

      return new Set(prev);
    });
  };

  const handleUnitSelection = (event: MouseEvent) => {
    const action = (event.target as HTMLElement)
      .closest("[data-action]")
      ?.getAttribute("data-action") as
      | "system"
      | "celsius"
      | "fahrenheit"
      | "km/h"
      | "mph"
      | "mm"
      | "in"
      | null;

    if (!action) {
      Logger.debug("Action target in header component not found", action);
      return;
    }

    switch (action) {
      case "system": {
        if (currentSystem === "metric") {
          setCurrentSystem("imperial");
          setImperialUnits();
        } else {
          setCurrentSystem("metric");
          setMetricUnits();
        }

        break;
      }
      case "celsius": {
        setCurrentUnits({ temperature: "°C" });
        break;
      }
      case "fahrenheit": {
        setCurrentUnits({ temperature: "°F" });
        break;
      }
      case "km/h": {
        setCurrentUnits({ wind_speed: "km/h" });
        break;
      }
      case "mph": {
        setCurrentUnits({ wind_speed: "mp/h" });
        break;
      }
      case "mm": {
        setCurrentUnits({ precipitation: "mm" });
        break;
      }
      case "in": {
        setCurrentUnits({ precipitation: "inch" });
        break;
      }
      default: {
        Logger.debug(
          "Action in header dropdown does not match any unit",
          action,
        );
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles["header-top"]}>
        <Image src={logo} alt="logo" className="logo" />
        <div className={styles["button-row"]}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="bookmark">+ Add bookmark</Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              style={{ "--radix-popper-anchor-width": "100%" }}
            >
              <ul>
                {bookmarkList.size ? (
                  [...bookmarkList].map((bookmark) => (
                    <li className={styles.bookmark}>
                      <Button onClick={() => handleChooseBookmark(bookmark)}>
                        {bookmark}
                      </Button>
                      <Button onClick={() => handleDeleteBookmark(bookmark)}>
                        <Image src={icon_close} className="icon-xsm"></Image>
                      </Button>
                    </li>
                  ))
                ) : (
                  <p>No bookmarks made.</p>
                )}
              </ul>
            </PopoverContent>
          </Popover>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="dropdown" intent="unit">
                <Image src={icon_units} alt="unit icon" />
                Units
                <Image src={icon_dropdown} alt="dropdown icon"></Image>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={handleUnitSelection}>
              <DropdownMenuItem asChild data-action="system">
                <Button variant="search-item">
                  {`Switch to ${currentSystem === "metric" ? "Imperial" : "Metric"}`}
                </Button>
              </DropdownMenuItem>
              <DropdownMenuLabel>Temperature</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={currentUnits.temperature === "°C"}
                data-action="celsius"
              >
                Celsius (°C)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentUnits.temperature === "°F"}
                data-action="fahrenheit"
              >
                Fahrenheit (°F)
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Wind Speed</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={currentUnits.wind_speed === "km/h"}
                data-action="km/h"
              >
                km/h
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentUnits.wind_speed === "mp/h"}
                data-action="mph"
              >
                mph
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Precipitation</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={currentUnits.precipitation === "mm"}
                data-action="mm"
              >
                Millimeters (mm)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentUnits.precipitation === "inch"}
                data-action="in"
              >
                Inches (in)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className={styles["header-bottom"]}>
        <h1 className={styles.heading}>How's the sky looking today?</h1>
        <SearchBar handleBookmark={handleBookmark} ref={searchBarRef} />
      </div>
    </header>
  );
}
