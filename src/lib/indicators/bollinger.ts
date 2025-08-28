import { OHLCVData, BollingerBandsSettings, BollingerBandsResult } from '../types';

/**
 * Calculate Simple Moving Average (SMA)
 * @param values Array of numbers
 * @param period Number of periods
 * @returns SMA value
 */
function calculateSMA(values: number[], period: number): number {
  if (values.length < period) return NaN;
  const sum = values.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate standard deviation using sample standard deviation formula
 * @param values Array of numbers
 * @param period Number of periods
 * @param mean Pre-calculated mean (SMA)
 * @returns Standard deviation
 */
function calculateStandardDeviation(values: number[], period: number, mean: number): number {
  if (values.length < period) return NaN;
  
  const recentValues = values.slice(-period);
  const squaredDifferences = recentValues.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / (period - 1); // Sample std dev
  
  return Math.sqrt(variance);
}

/**
 * Compute Bollinger Bands for given OHLCV data
 * 
 * Formula:
 * - Basis (middle band) = SMA(source, length)
 * - Standard Deviation = sample standard deviation of last 'length' values
 * - Upper Band = Basis + (StdDev multiplier * StdDev)
 * - Lower Band = Basis - (StdDev multiplier * StdDev)
 * - Offset: shifts all bands by 'offset' bars
 * 
 * @param data OHLCV data array
 * @param settings Bollinger Bands configuration
 * @returns Array of Bollinger Bands results
 */
export function computeBollingerBands(
  data: OHLCVData[],
  settings: BollingerBandsSettings
): BollingerBandsResult[] {
  const { length, source, stdDev: multiplier, offset } = settings;
  const results: BollingerBandsResult[] = [];
  
  // Extract source values (currently only 'close' is supported)
  const sourceValues = data.map(candle => candle.close);
  
  // Calculate bands for each data point
  for (let i = 0; i < data.length; i++) {
    if (i < length - 1) {
      // Not enough data points for calculation
      results.push({
        timestamp: data[i].timestamp,
        basis: NaN,
        upper: NaN,
        lower: NaN,
      });
      continue;
    }
    
    // Calculate basis (SMA)
    const basis = calculateSMA(sourceValues.slice(0, i + 1), length);
    
    // Calculate standard deviation
    const stdDev = calculateStandardDeviation(sourceValues.slice(0, i + 1), length, basis);
    
    // Calculate upper and lower bands
    const upper = basis + (multiplier * stdDev);
    const lower = basis - (multiplier * stdDev);
    
    results.push({
      timestamp: data[i].timestamp,
      basis,
      upper,
      lower,
    });
  }
  
  // Apply offset if specified
  if (offset !== 0) {
    return applyOffset(results, offset);
  }
  
  return results;
}

/**
 * Apply offset to Bollinger Bands results
 * Positive offset shifts bands forward, negative shifts backward
 * @param results Original results
 * @param offset Number of bars to shift
 * @returns Offset results
 */
function applyOffset(results: BollingerBandsResult[], offset: number): BollingerBandsResult[] {
  if (offset === 0) return results;
  
  const offsetResults: BollingerBandsResult[] = [];
  
  for (let i = 0; i < results.length; i++) {
    const sourceIndex = i - offset;
    
    if (sourceIndex < 0 || sourceIndex >= results.length) {
      // Out of bounds, use NaN values
      offsetResults.push({
        timestamp: results[i].timestamp,
        basis: NaN,
        upper: NaN,
        lower: NaN,
      });
    } else {
      // Copy values from offset source
      offsetResults.push({
        timestamp: results[i].timestamp,
        basis: results[sourceIndex].basis,
        upper: results[sourceIndex].upper,
        lower: results[sourceIndex].lower,
      });
    }
  }
  
  return offsetResults;
}

/**
 * Validate Bollinger Bands settings
 * @param settings Settings to validate
 * @returns Validation result and error message
 */
export function validateBollingerSettings(settings: BollingerBandsSettings): {
  isValid: boolean;
  error?: string;
} {
  if (settings.length < 2) {
    return { isValid: false, error: 'Length must be at least 2' };
  }
  
  if (settings.stdDev <= 0) {
    return { isValid: false, error: 'Standard deviation multiplier must be positive' };
  }
  
  if (settings.maType !== 'SMA') {
    return { isValid: false, error: 'Only SMA is supported for this assignment' };
  }
  
  if (settings.source !== 'close') {
    return { isValid: false, error: 'Only close price is supported as source' };
  }
  
  return { isValid: true };
}