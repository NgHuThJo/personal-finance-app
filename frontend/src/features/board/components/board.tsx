import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import styles from "./board.module.css";
import { bg_today_large, bg_today_small } from "#frontend/assets/images";
import { CurrentCard } from "#frontend/features/board/components/current-card";
import { HourlyBoard } from "#frontend/features/board/components/hourly-board";
import {
  mapCurrentWeatherToUI,
  mapDailyWeatherToUI,
} from "#frontend/features/board/model/mapping";
import { weatherQueryOptions } from "#frontend/shared/api/query-options/weather";
import {
  formatWeatherDateForUI,
  formatWeatherValue,
} from "#frontend/shared/app/formatting";
import { getWeatherIcon } from "#frontend/shared/app/icons";
import { Image } from "#frontend/shared/primitives/image";
import { useLocationData } from "#frontend/shared/store/location";
import { useCurrentSystem, useCurrentUnits } from "#frontend/shared/store/unit";
import type {
  CurrentUnits,
  DailyUnits,
  HourlyUnits,
} from "#frontend/shared/types/weather";

export function Board() {
  const { latitude, longitude } = useLocationData();
  const currentSystem = useCurrentSystem();
  const currentUnits = useCurrentUnits();
  const { data: weatherData } = useSuspenseQuery(
    weatherQueryOptions.location(latitude, longitude),
  );
  const dailyListRef = useRef<HTMLUListElement>(null);
  const currentListRef = useRef<HTMLDivElement>(null);

  const unitData =
    currentSystem === "metric" ? weatherData.metric : weatherData.imperial;

  useEffect(() => {
    if (!dailyListRef.current || !currentListRef.current) {
      return;
    }
    const dailyList = dailyListRef.current;
    const currentList = currentListRef.current;
    const dailyListElements = dailyList.querySelectorAll("li");
    const currentListElements = currentList.querySelectorAll("div");
    dailyListElements.forEach((element, index) => {
      element.style.setProperty("--index", String(index));
    });
    currentListElements.forEach((element, index) => {
      element.style.setProperty("--index", String(index));
    });
  }, []);

  const currentUnit = {
    ...unitData.current_units,
    apparent_temperature: currentUnits.temperature,
    wind_speed_10m: currentUnits.wind_speed,
    precipitation: currentUnits.precipitation,
  } satisfies {
    [K in keyof CurrentUnits]: CurrentUnits[K];
  };
  const dailyUnit = {
    ...unitData.daily_units,
    temperature_2m_max: currentUnits.temperature,
    temperature_2m_min: currentUnits.temperature,
  } satisfies {
    [K in keyof DailyUnits]: DailyUnits[K];
  };
  const hourlyUnits = {
    ...unitData.hourly_units,
    temperature_2m: currentUnits.temperature,
  } satisfies {
    [K in keyof HourlyUnits]: HourlyUnits[K];
  };

  const current = {
    data: {
      ...unitData.current,
      apparent_temperature:
        currentUnits.temperature === "°C"
          ? weatherData.metric.current.apparent_temperature
          : weatherData.imperial.current.apparent_temperature,
      wind_speed_10m:
        currentUnits.wind_speed === "km/h"
          ? weatherData.metric.current.wind_speed_10m
          : weatherData.imperial.current.wind_speed_10m,
      precipitation:
        currentUnits.precipitation === "mm"
          ? weatherData.metric.current.precipitation
          : weatherData.imperial.current.precipitation,
    },
    units: currentUnit,
  };
  const daily = {
    data: unitData.daily.map((day, index) => ({
      ...day,
      temperature_2m_max:
        currentUnits.temperature === "°C"
          ? (weatherData.metric.daily[index]?.temperature_2m_max ?? 0)
          : (weatherData.imperial.daily[index]?.temperature_2m_max ?? 0),
      temperature_2m_min:
        currentUnits.temperature === "°C"
          ? (weatherData.metric.daily[index]?.temperature_2m_min ?? 0)
          : (weatherData.imperial.daily[index]?.temperature_2m_min ?? 0),
    })),
    units: dailyUnit,
  };
  const hourly = {
    data: unitData.hourly.map((hour, index) => ({
      ...hour,
      temperature_2m:
        currentUnits.temperature === "°C"
          ? (weatherData.metric.hourly[index]?.apparent_temperature ?? 0)
          : (weatherData.imperial.hourly[index]?.apparent_temperature ?? 0),
    })),
    units: hourlyUnits,
  };

  const currentDataArray = mapCurrentWeatherToUI(current);
  const dailyDataArray = mapDailyWeatherToUI(daily);

  return (
    <div className={styles.board}>
      <div className={styles.current}>
        <div className={styles.stack}>
          <Image
            className="background"
            src={bg_today_small}
            srcSet={`${bg_today_small} 343w, ${bg_today_large} 800w`}
            sizes="(width < 768px) 343px, 800px"
          />
          <div className={styles["image-container"]}>
            <div className={styles["image-left"]}>
              <h2
                className={styles["image-heading"]}
                data-testid="current-hero-city-and-country-name"
              >{`${unitData.city}, ${unitData.country}`}</h2>
              <p
                className={styles["image-day"]}
              >{`${formatWeatherDateForUI(new Date(unitData.current.time))}`}</p>
            </div>
            <div className={styles["image-right"]}>
              <Image
                src={
                  getWeatherIcon(
                    unitData.current.weather_code,
                    unitData.current.is_day,
                  ).image
                }
                className="icon-bg"
              ></Image>
              <p
                className={styles["image-temperature"]}
                data-testid="current-hero-temperature"
              >
                {formatWeatherValue(
                  currentUnits.temperature === "°C"
                    ? weatherData.metric.current.temperature_2m
                    : weatherData.imperial.current.temperature_2m,
                  currentUnits.temperature,
                )}
              </p>
            </div>
          </div>
        </div>
        <div
          className={styles["card-layout"]}
          ref={currentListRef}
          data-testid="current-list"
        >
          {currentDataArray.map(([description, { unit, value, separator }]) => (
            <CurrentCard
              text={description}
              value={value}
              unit={unit}
              separator={separator}
              key={description}
              data-testid="current-list-item"
            ></CurrentCard>
          ))}
        </div>
      </div>
      <div className={styles.daily}>
        <h2>Daily forecast</h2>
        <ul
          className={styles["daily-list"]}
          ref={dailyListRef}
          data-testid="daily-list"
        >
          {dailyDataArray.map(
            (
              {
                day,
                max: [maxTemp, maxUnit],
                min: [minTemp, minUnit],
                weather_code,
              },
              index,
            ) => (
              <li
                key={index}
                className={styles["daily-card"]}
                data-testid="daily-list-item"
              >
                <h3 className={styles["daily-heading"]}>{day}</h3>
                <Image
                  src={getWeatherIcon(weather_code).image}
                  className="icon-md"
                ></Image>
                <div className={styles["daily-temperature"]}>
                  <span>{`${maxTemp} ${maxUnit}`}</span>
                  <span>{`${minTemp} ${minUnit}`}</span>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
      <div className={styles.hourly}>
        <HourlyBoard data={hourly.data} units={hourly.units} />
      </div>
    </div>
  );
}
