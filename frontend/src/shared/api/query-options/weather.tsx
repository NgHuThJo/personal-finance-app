import { queryOptions } from "@tanstack/react-query";
import { fetchData } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { ReverseGeocodingResponse } from "#frontend/shared/types/reverse-geocoding";
import {
  type DailyWeather,
  type HourlyWeather,
  type WeatherData,
  weatherSchema,
} from "#frontend/shared/types/weather";
import { assignValue } from "#frontend/shared/utils/object";

export const weatherQueryKeys = {
  all: () => ["weather"],
  location: (latitude: number, longitude: number) => [
    [...weatherQueryKeys.all(), latitude, longitude],
  ],
};

export const weatherQueryOptions = {
  location: (latitude: number, longitude: number) =>
    queryOptions({
      queryKey: weatherQueryKeys.location(latitude, longitude),
      queryFn: async () => {
        const baseWeatherParamsInMetric = createBaseWeatherParams(
          latitude,
          longitude,
        );
        const baseWeatherParamsInImperial = {
          ...baseWeatherParamsInMetric,
          wind_speed_unit: "mph",
          temperature_unit: "fahrenheit",
          precipitation_unit: "inch",
        };
        const meteoUrl = import.meta.env.VITE_METEO_FORECAST_BASE_URL;
        const geoapifyUrl = import.meta.env
          .VITE_GEOAPIFY_REVERSE_GEOCODING_BASE_URL;
        const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
        const metricQueryString: Partial<
          Record<BaseWeatherParamsKeys, string>
        > = {};
        const imperialQueryString: Partial<
          Record<BaseWeatherParamsKeys, string>
        > = {};

        for (const key of Object.keys(
          baseWeatherParamsInMetric,
        ) as BaseWeatherParamsKeys[]) {
          metricQueryString[key] = Array.isArray(baseWeatherParamsInMetric[key])
            ? baseWeatherParamsInMetric[key].join(",")
            : String(baseWeatherParamsInMetric[key]);
        }

        for (const key of Object.keys(
          baseWeatherParamsInImperial,
        ) as BaseWeatherParamsKeys[]) {
          imperialQueryString[key] = Array.isArray(
            baseWeatherParamsInImperial[key],
          )
            ? baseWeatherParamsInImperial[key].join(",")
            : String(baseWeatherParamsInImperial[key]);
        }

        const [metric, imperial, geoapify]: [
          WeatherData,
          WeatherData,
          ReverseGeocodingResponse,
        ] = await Promise.all([
          fetchData(
            `${meteoUrl}?${new URLSearchParams(metricQueryString).toString()}`,
          ),
          fetchData(
            `${meteoUrl}?${new URLSearchParams(imperialQueryString).toString()}`,
          ),
          fetchData(
            `${geoapifyUrl}?${new URLSearchParams({
              lat: String(latitude),
              lon: String(longitude),
              type: "city",
              apiKey: geoapifyApiKey,
            }).toString()}`,
          ),
        ]);

        const validatedMetricData = weatherSchema.safeParse(metric);
        const validatedImperialData = weatherSchema.safeParse(imperial);

        if (!validatedMetricData.success) {
          Logger.error(
            "Metric data has unexpected shape",
            validatedMetricData.error,
          );
          throw new Error("Validation error");
        }
        if (!validatedImperialData.success) {
          Logger.error(
            "Imperial data has unexpected shape",
            validatedImperialData.error,
          );
          throw new Error("Validation error");
        }

        const metricDaily = metric.daily;
        const metricHourly = metric.hourly;
        const imperialDaily = imperial.daily;
        const imperialHourly = imperial.hourly;
        const city = geoapify.features[0]?.properties.city;
        const country = geoapify.features[0]?.properties.country;

        const projectedData = {
          metric: {
            ...metric,
            country,
            city,
            current: metric.current,
            current_units: metric.current_units,
            daily: transformDailyData(metricDaily),
            daily_units: metric.daily_units,
            hourly: transformHourlyData(metricHourly),
            hourly_units: metric.hourly_units,
          },
          imperial: {
            ...imperial,
            country,
            city,
            current: imperial.current,
            current_units: imperial.current_units,
            daily: transformDailyData(imperialDaily),
            daily_units: imperial.daily_units,
            hourly: transformHourlyData(imperialHourly),
            hourly_units: imperial.current_units,
          },
        };

        return projectedData;
      },
    }),
};

function createBaseWeatherParams(latitude: number, longitude: number) {
  return {
    latitude,
    longitude,
    daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "wind_speed_10m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "is_day",
    ],
    current: [
      "temperature_2m",
      "precipitation",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ],
    timezone: "auto",
  };
}

type BaseWeatherParamsKeys = keyof ReturnType<typeof createBaseWeatherParams>;

function transformDailyData(obj: DailyWeather) {
  const daily = [...Array(obj.time.length)].map((_, i) => {
    const temp = {} as {
      [K in keyof DailyWeather]: DailyWeather[K][number];
    };

    for (const key of Object.keys(obj) as (keyof DailyWeather)[]) {
      if (!(i in obj[key]) || obj[key][i] === undefined) {
        Logger.debug("Index key does not exist", {
          obj,
          key,
        });
        throw new Error("Indexed key does not exist");
      }

      assignValue(temp, key, obj[key][i]);
    }

    return temp;
  });

  return daily;
}

function transformHourlyData(obj: HourlyWeather) {
  const hourly = [...Array(obj.time.length)].map((_, i) => {
    const temp = {} as {
      [K in keyof HourlyWeather]: HourlyWeather[K][number];
    };

    for (const key of Object.keys(obj) as (keyof HourlyWeather)[]) {
      if (!(i in obj[key]) || obj[key][i] === undefined) {
        throw new Error("Index does not exist");
      }

      assignValue(temp, key, obj[key][i]);
    }

    return temp;
  });

  return hourly;
}
