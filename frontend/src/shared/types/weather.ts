import { z } from "zod";
import type { ToNumber } from "#frontend/shared/types/miscellaneous";

export const weatherIcons = {
  "0": {
    day: {
      description: "Sunny",
      image: "http://openweathermap.org/img/wn/01d@2x.png",
    },
    night: {
      description: "Clear",
      image: "http://openweathermap.org/img/wn/01n@2x.png",
    },
  },
  "1": {
    day: {
      description: "Mainly Sunny",
      image: "http://openweathermap.org/img/wn/01d@2x.png",
    },
    night: {
      description: "Mainly Clear",
      image: "http://openweathermap.org/img/wn/01n@2x.png",
    },
  },
  "2": {
    day: {
      description: "Partly Cloudy",
      image: "http://openweathermap.org/img/wn/02d@2x.png",
    },
    night: {
      description: "Partly Cloudy",
      image: "http://openweathermap.org/img/wn/02n@2x.png",
    },
  },
  "3": {
    day: {
      description: "Cloudy",
      image: "http://openweathermap.org/img/wn/03d@2x.png",
    },
    night: {
      description: "Cloudy",
      image: "http://openweathermap.org/img/wn/03n@2x.png",
    },
  },
  "45": {
    day: {
      description: "Foggy",
      image: "http://openweathermap.org/img/wn/50d@2x.png",
    },
    night: {
      description: "Foggy",
      image: "http://openweathermap.org/img/wn/50n@2x.png",
    },
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "http://openweathermap.org/img/wn/50d@2x.png",
    },
    night: {
      description: "Rime Fog",
      image: "http://openweathermap.org/img/wn/50n@2x.png",
    },
  },
  "51": {
    day: {
      description: "Light Drizzle",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Light Drizzle",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "53": {
    day: {
      description: "Drizzle",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Drizzle",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "55": {
    day: {
      description: "Heavy Drizzle",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Heavy Drizzle",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Light Freezing Drizzle",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Freezing Drizzle",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "61": {
    day: {
      description: "Light Rain",
      image: "http://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Light Rain",
      image: "http://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "63": {
    day: {
      description: "Rain",
      image: "http://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Rain",
      image: "http://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "65": {
    day: {
      description: "Heavy Rain",
      image: "http://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Heavy Rain",
      image: "http://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "66": {
    day: {
      description: "Light Freezing Rain",
      image: "http://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Light Freezing Rain",
      image: "http://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "67": {
    day: {
      description: "Freezing Rain",
      image: "http://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Freezing Rain",
      image: "http://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "http://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Light Snow",
      image: "http://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "73": {
    day: {
      description: "Snow",
      image: "http://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Snow",
      image: "http://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "http://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Heavy Snow",
      image: "http://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "http://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Snow Grains",
      image: "http://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "80": {
    day: {
      description: "Light Showers",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Light Showers",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "81": {
    day: {
      description: "Showers",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Showers",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "82": {
    day: {
      description: "Heavy Showers",
      image: "http://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Heavy Showers",
      image: "http://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "http://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Light Snow Showers",
      image: "http://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "http://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Snow Showers",
      image: "http://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "http://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Thunderstorm",
      image: "http://openweathermap.org/img/wn/11n@2x.png",
    },
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "http://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "http://openweathermap.org/img/wn/11n@2x.png",
    },
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "http://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "http://openweathermap.org/img/wn/11n@2x.png",
    },
  },
};

const temperatureUnits = ["°C", "°F"] as const;
const windSpeedUnits = ["km/h", "mp/h"] as const;
const precipitationUnits = ["mm", "inch"] as const;

type WeatherCode = keyof typeof weatherIcons;
const weatherCodeSchema = z.literal(
  (Object.keys(weatherIcons) as WeatherCode[]).map<WeatherCodeNumber>(
    (key) => Number(key) as WeatherCodeNumber,
  ),
);
const isDaySchema = z.literal([0, 1]);

export const weatherSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number(),
  current_units: z.object({
    time: z.string(),
    interval: z.string(),
    temperature_2m: z.literal(temperatureUnits),
    precipitation: z.literal(precipitationUnits),
    relative_humidity_2m: z.string(),
    apparent_temperature: z.literal(temperatureUnits),
    weather_code: z.string(),
    wind_speed_10m: z.literal(windSpeedUnits),
    is_day: z.string(),
  }),
  current: z.object({
    time: z.iso.datetime({ local: true }),
    interval: z.number(),
    temperature_2m: z.number(),
    precipitation: z.number(),
    relative_humidity_2m: z.number(),
    apparent_temperature: z.number(),
    weather_code: weatherCodeSchema,
    wind_speed_10m: z.number(),
    is_day: isDaySchema,
  }),
  hourly_units: z.object({
    time: z.string(),
    temperature_2m: z.literal(temperatureUnits),
    apparent_temperature: z.literal(temperatureUnits),
    wind_speed_10m: z.literal(windSpeedUnits),
    relative_humidity_2m: z.string(),
    precipitation: z.literal(precipitationUnits),
    weather_code: z.string(),
    is_day: z.string(),
  }),
  hourly: z.object({
    time: z.array(z.iso.datetime({ local: true })),
    temperature_2m: z.array(z.number()),
    apparent_temperature: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    precipitation: z.array(z.number()),
    weather_code: z.array(weatherCodeSchema),
    is_day: z.array(isDaySchema),
  }),
  daily_units: z.object({
    time: z.string(),
    temperature_2m_max: z.literal(temperatureUnits),
    temperature_2m_min: z.literal(temperatureUnits),
    weather_code: z.string(),
  }),
  daily: z.object({
    time: z.array(z.iso.date()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    weather_code: z.array(weatherCodeSchema),
  }),
});

export const dailyWeatherValuesSchema = z.object({
  time: weatherSchema.shape.daily.shape.time.element,
  temperature_2m_max:
    weatherSchema.shape.daily.shape.temperature_2m_max.element,
  temperature_2m_min:
    weatherSchema.shape.daily.shape.temperature_2m_min.element,
  weather_code: weatherSchema.shape.daily.shape.weather_code.element,
});

export const hourlyWeatherValuesSchema = z.object({
  time: weatherSchema.shape.hourly.shape.time.element,
  temperature_2m: weatherSchema.shape.hourly.shape.temperature_2m.element,
  apparent_temperature:
    weatherSchema.shape.hourly.shape.apparent_temperature.element,
  wind_speed_10m: weatherSchema.shape.hourly.shape.wind_speed_10m.element,
  precipitation: weatherSchema.shape.hourly.shape.precipitation.element,
  relative_humidity_2m: weatherSchema.shape.hourly.shape.precipitation.element,
  weather_code: weatherSchema.shape.hourly.shape.weather_code.element,
  is_day: weatherSchema.shape.hourly.shape.is_day.element,
});

export const currentWeatherSchema = weatherSchema.shape.current;
export const currentUnitsSchema = weatherSchema.shape.current_units;
export const dailyWeatherSchema = weatherSchema.shape.daily;
export const dailyUnitsSchema = weatherSchema.shape.daily_units;
export const hourlyWeatherSchema = weatherSchema.shape.hourly;
export const hourlyUnitsSchema = weatherSchema.shape.hourly_units;

export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type DailyWeather = z.infer<typeof dailyWeatherSchema>;
export type HourlyWeather = z.infer<typeof hourlyWeatherSchema>;
export type CurrentUnits = z.infer<typeof currentUnitsSchema>;
export type DailyUnits = z.infer<typeof dailyUnitsSchema>;
export type HourlyUnits = z.infer<typeof hourlyUnitsSchema>;
export type WeatherData = z.infer<typeof weatherSchema>;
export type WeatherCodeNumber = ToNumber<WeatherCode>;
export type IsDay = 0 | 1;
export type DailyWeatherValues = z.infer<typeof dailyWeatherValuesSchema>;
export type HourlyWeatherValues = z.infer<typeof hourlyWeatherValuesSchema>;
