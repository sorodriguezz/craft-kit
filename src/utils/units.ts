/**
 * Unit-conversion helpers for temperature, length, mass and angle. Every
 * function takes a single numeric value and returns the converted number; none
 * of them mutate their inputs.
 */
export const units = {
  /**
   * Convert a temperature from Celsius to Fahrenheit.
   *
   * @param value - Temperature in degrees Celsius.
   * @returns The temperature in degrees Fahrenheit.
   *
   * @example
   * units.celsiusToFahrenheit(100); // 212
   */
  celsiusToFahrenheit(value: number): number {
    return (value * 9) / 5 + 32;
  },

  /**
   * Convert a temperature from Fahrenheit to Celsius.
   *
   * @param value - Temperature in degrees Fahrenheit.
   * @returns The temperature in degrees Celsius.
   *
   * @example
   * units.fahrenheitToCelsius(32); // 0
   */
  fahrenheitToCelsius(value: number): number {
    return ((value - 32) * 5) / 9;
  },

  /**
   * Convert a temperature from Celsius to Kelvin.
   *
   * @param value - Temperature in degrees Celsius.
   * @returns The temperature in kelvin.
   *
   * @example
   * units.celsiusToKelvin(0); // 273.15
   */
  celsiusToKelvin(value: number): number {
    return value + 273.15;
  },

  /**
   * Convert a temperature from Kelvin to Celsius.
   *
   * @param value - Temperature in kelvin.
   * @returns The temperature in degrees Celsius.
   *
   * @example
   * units.kelvinToCelsius(273.15); // 0
   */
  kelvinToCelsius(value: number): number {
    return value - 273.15;
  },

  /**
   * Convert a temperature from Fahrenheit to Kelvin.
   *
   * @param value - Temperature in degrees Fahrenheit.
   * @returns The temperature in kelvin.
   *
   * @example
   * units.fahrenheitToKelvin(32); // 273.15
   */
  fahrenheitToKelvin(value: number): number {
    return ((value - 32) * 5) / 9 + 273.15;
  },

  /**
   * Convert a temperature from Kelvin to Fahrenheit.
   *
   * @param value - Temperature in kelvin.
   * @returns The temperature in degrees Fahrenheit.
   *
   * @example
   * units.kelvinToFahrenheit(273.15); // 32
   */
  kelvinToFahrenheit(value: number): number {
    return ((value - 273.15) * 9) / 5 + 32;
  },

  /**
   * Convert a distance from kilometers to miles.
   *
   * @param value - Distance in kilometers.
   * @returns The distance in miles.
   *
   * @example
   * units.kmToMiles(1); // 0.621371...
   */
  kmToMiles(value: number): number {
    return value / 1.609344;
  },

  /**
   * Convert a distance from miles to kilometers.
   *
   * @param value - Distance in miles.
   * @returns The distance in kilometers.
   *
   * @example
   * units.milesToKm(1); // 1.609344
   */
  milesToKm(value: number): number {
    return value * 1.609344;
  },

  /**
   * Convert a length from meters to feet.
   *
   * @param value - Length in meters.
   * @returns The length in feet.
   *
   * @example
   * units.metersToFeet(1); // 3.28084...
   */
  metersToFeet(value: number): number {
    return value / 0.3048;
  },

  /**
   * Convert a length from feet to meters.
   *
   * @param value - Length in feet.
   * @returns The length in meters.
   *
   * @example
   * units.feetToMeters(1); // 0.3048
   */
  feetToMeters(value: number): number {
    return value * 0.3048;
  },

  /**
   * Convert a length from centimeters to inches.
   *
   * @param value - Length in centimeters.
   * @returns The length in inches.
   *
   * @example
   * units.cmToInches(2.54); // 1
   */
  cmToInches(value: number): number {
    return value / 2.54;
  },

  /**
   * Convert a length from inches to centimeters.
   *
   * @param value - Length in inches.
   * @returns The length in centimeters.
   *
   * @example
   * units.inchesToCm(1); // 2.54
   */
  inchesToCm(value: number): number {
    return value * 2.54;
  },

  /**
   * Convert a mass from kilograms to pounds.
   *
   * @param value - Mass in kilograms.
   * @returns The mass in pounds.
   *
   * @example
   * units.kgToPounds(1); // 2.204622...
   */
  kgToPounds(value: number): number {
    return value / 0.45359237;
  },

  /**
   * Convert a mass from pounds to kilograms.
   *
   * @param value - Mass in pounds.
   * @returns The mass in kilograms.
   *
   * @example
   * units.poundsToKg(1); // 0.45359237
   */
  poundsToKg(value: number): number {
    return value * 0.45359237;
  },

  /**
   * Convert a mass from grams to ounces.
   *
   * @param value - Mass in grams.
   * @returns The mass in ounces.
   *
   * @example
   * units.gramsToOunces(28.349523125); // 1
   */
  gramsToOunces(value: number): number {
    return value / 28.349523125;
  },

  /**
   * Convert a mass from ounces to grams.
   *
   * @param value - Mass in ounces.
   * @returns The mass in grams.
   *
   * @example
   * units.ouncesToGrams(1); // 28.349523125
   */
  ouncesToGrams(value: number): number {
    return value * 28.349523125;
  },

  /**
   * Convert an angle from degrees to radians.
   *
   * @param value - Angle in degrees.
   * @returns The angle in radians.
   *
   * @example
   * units.degreesToRadians(180); // 3.141592...
   */
  degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
  },

  /**
   * Convert an angle from radians to degrees.
   *
   * @param value - Angle in radians.
   * @returns The angle in degrees.
   *
   * @example
   * units.radiansToDegrees(Math.PI); // 180
   */
  radiansToDegrees(value: number): number {
    return (value * 180) / Math.PI;
  },
} as const;
