import { zocker } from "zocker";
import {
  mapCurrentWeatherToUI,
  mapDailyWeatherToUI,
  mapHourlyWeatherToUI,
} from "#frontend/features/board/model/mapping";

import {
  currentUnitsSchema,
  currentWeatherSchema,
  dailyUnitsSchema,
  dailyWeatherValuesSchema,
  hourlyUnitsSchema,
  hourlyWeatherValuesSchema,
} from "#frontend/shared/types/weather";

const currentWeatherMockData = zocker(currentWeatherSchema).generate();
const currentUnitsMockData = zocker(currentUnitsSchema).generate();
const dailyWeatherMockData = zocker(dailyWeatherValuesSchema)
  .supply(dailyWeatherValuesSchema.shape.time, "2025-10-21T00:00:00Z")
  .generateMany(2);
const dailyUnitsMockData = zocker(dailyUnitsSchema).generate();
const hourlyWeatherMockData = zocker(hourlyWeatherValuesSchema)
  .supply(hourlyWeatherValuesSchema.shape.time, "2025-10-21T00:00:00Z")
  .generateMany(2);
const hourlyUnitsMockData = zocker(hourlyUnitsSchema).generate();

describe("mapCurrentWeatherForUI", () => {
  it("should return the correct mapped object", () => {
    const mappedData = mapCurrentWeatherToUI({
      data: currentWeatherMockData,
      units: currentUnitsMockData,
    });

    mappedData.forEach(([_, obj]) => {
      expect(obj).toEqual(
        expect.objectContaining({
          separator: expect.any(String),
          value: expect.any(Number),
          unit: expect.any(String),
        }),
      );
    });
  });
});

describe("mapDailyWeatherForUI", () => {
  it("should return the correct mapped object", () => {
    const mappedData = mapDailyWeatherToUI({
      data: dailyWeatherMockData,
      units: dailyUnitsMockData,
    });

    mappedData.forEach((obj) => {
      expect(obj).toEqual(
        expect.objectContaining({
          max: expect.arrayContaining([expect.any(Number), expect.any(String)]),
          min: expect.arrayContaining([expect.any(Number), expect.any(String)]),
          day: expect.any(String),
          weather_code: expect.any(Number),
        }),
      );
    });
  });
});

describe("mapHourlyWeatherForUI", () => {
  it("should return the correct mapped object", () => {
    const mappedData = mapHourlyWeatherToUI({
      data: hourlyWeatherMockData,
      units: hourlyUnitsMockData,
    });

    mappedData.forEach((obj) => {
      expect(obj).toEqual(
        expect.objectContaining({
          hour: expect.any(String),
          day: expect.any(String),
          weather_code: expect.any(Number),
          temperature: expect.arrayContaining([
            expect.any(Number),
            expect.any(String),
          ]),
          isDay: expect.toBeOneOf([0, 1]),
        }),
      );
    });
  });
});
