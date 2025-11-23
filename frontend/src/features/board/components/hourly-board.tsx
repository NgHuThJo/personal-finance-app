import { useLayoutEffect, useRef, useState } from "react";
import styles from "./hourly-board.module.css";
import { icon_dropdown } from "#frontend/assets/images";
import { mapHourlyWeatherToUI } from "#frontend/features/board/model/mapping";
import { MAX_HOURLY_ENTRIES } from "#frontend/shared/app/constants";
import { getWeatherIcon } from "#frontend/shared/app/icons";
import { Button } from "#frontend/shared/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#frontend/shared/primitives/dropdown";
import { Image } from "#frontend/shared/primitives/image";
import type {
  HourlyUnits,
  HourlyWeatherValues,
} from "#frontend/shared/types/weather";
import { getDayFromDate } from "#frontend/shared/utils/intl";

type HourlyBoardProps = {
  data: HourlyWeatherValues[];
  units: HourlyUnits;
};

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function HourlyBoard({ data, units }: HourlyBoardProps) {
  const [currentDay, setCurrentDay] = useState(() =>
    getDayFromDate({
      date: new Date(),
      options: {
        weekday: "long",
      },
    }),
  );
  const hourlyListRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!hourlyListRef.current) {
      return;
    }

    const list = hourlyListRef.current;
    const listElements = list.querySelectorAll("li");
    listElements.forEach((element, index) => {
      element.style.setProperty("--index", String(index));
    });
  }, []);

  const hourlyDataArray = mapHourlyWeatherToUI({ data, units })
    .filter((data) => data.day === currentDay)
    .slice(0, MAX_HOURLY_ENTRIES);

  const handleChooseWeekDay = (day: string) => {
    setCurrentDay(day);
  };

  return (
    <div>
      <div className={styles["top-heading"]}>
        <h2 className={styles.heading}>Hourly forecast</h2>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="dropdown"
              intent="weekday"
              data-testid="weekday-button"
            >
              {currentDay} <Image src={icon_dropdown} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={currentDay}>
              {weekDays.map((day, index) => (
                <DropdownMenuRadioItem
                  onSelect={() => handleChooseWeekDay(day)}
                  value={day}
                  key={index}
                >
                  {day}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ul className={styles.list} ref={hourlyListRef} data-testid="hourly-list">
        {hourlyDataArray.map(
          ({ hour, weather_code, temperature, isDay }, index) => (
            <li
              key={index}
              className={styles["list-item"]}
              data-testid="hourly-list-item"
            >
              <div>
                <Image
                  src={getWeatherIcon(weather_code, isDay).image}
                  className="icon-sm"
                ></Image>
                <span>{hour}</span>
              </div>
              <span>{temperature}</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
