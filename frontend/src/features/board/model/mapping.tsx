import type { KeyValueTuple } from "#frontend/shared/types/miscellaneous";
import type {
  CurrentUnits,
  CurrentWeather,
  DailyUnits,
  DailyWeatherValues,
  HourlyUnits,
  HourlyWeatherValues,
} from "#frontend/shared/types/weather";
import { getDayFromDate, getHourFromDate } from "#frontend/shared/utils/intl";

type CurrentWeatherMapper = {
  data: CurrentWeather;
  units: CurrentUnits;
};

type DailyWeatherMapper = {
  data: DailyWeatherValues[];
  units: DailyUnits;
};

type HourlyWeatherMapper = {
  data: HourlyWeatherValues[];
  units: HourlyUnits;
};

export function mapCurrentWeatherToUI({ data, units }: CurrentWeatherMapper) {
  const currentData = {
    ["Feels Like"]: {
      unit: units.apparent_temperature,
      value: data.apparent_temperature,
      separator: "",
    },

    Humidity: {
      unit: units.relative_humidity_2m,
      value: data.relative_humidity_2m,
      separator: "",
    },
    Wind: {
      unit: units.wind_speed_10m,
      value: data.wind_speed_10m,
      separator: " ",
    },
    Precipitation: {
      unit: units.precipitation,
      value: data.precipitation,
      separator: " ",
    },
  };

  return Object.entries(currentData) as KeyValueTuple<typeof currentData>[];
}

export function mapDailyWeatherToUI({ data, units }: DailyWeatherMapper) {
  const dailyData = data.map((day) => ({
    max: [day.temperature_2m_max, units.temperature_2m_max] as const,
    min: [day.temperature_2m_min, units.temperature_2m_min] as const,
    day: getDayFromDate({ date: new Date(day.time) }),
    weather_code: day.weather_code,
  }));

  return dailyData;
}

export function mapHourlyWeatherToUI({ data, units }: HourlyWeatherMapper) {
  const hourlyData = data.map((hour) => ({
    hour: getHourFromDate({ date: new Date(hour.time) }),
    day: getDayFromDate({
      date: new Date(hour.time),
      options: { weekday: "long" },
    }),
    weather_code: hour.weather_code,
    temperature: [hour.temperature_2m, units.temperature_2m] as const,
    isDay: hour.is_day,
  }));

  return hourlyData;
}
