import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart as KLineChart } from 'klinecharts';
import { OHLCVData, BollingerBandsConfig, BollingerBandsResult } from '@/lib/types';
import { computeBollingerBands } from '@/lib/indicators/bollinger';

interface ChartProps {
  data: OHLCVData[];
  bollingerConfig: BollingerBandsConfig;
  onBollingerUpdate?: (results: BollingerBandsResult[]) => void;
}

const Chart: React.FC<ChartProps> = ({ data, bollingerConfig, onBollingerUpdate }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<KLineChart | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  // Convert OHLCV data to KLineCharts format
  const formatDataForChart = useCallback((ohlcvData: OHLCVData[]) => {
    return ohlcvData.map(item => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      const chart = init(chartRef.current, {
        locale: 'en-US',
        timezone: 'UTC',
        styles: {
          candle: {
            bar: {
              upColor: '#00b894',
              downColor: '#e74c3c',
              upBorderColor: '#00b894',
              downBorderColor: '#e74c3c',
              upWickColor: '#00b894',
              downWickColor: '#e74c3c',
            },
          },
        },
      });

      if (chart) {
        chartInstanceRef.current = chart;
        setIsChartReady(true);
      }
    } catch (error) {
      console.error('Failed to initialize chart:', error);
    }

    return () => {
      if (chartInstanceRef.current) {
        dispose(chartRef.current!);
        chartInstanceRef.current = null;
        setIsChartReady(false);
      }
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!isChartReady || !chartInstanceRef.current || !data.length) return;

    try {
      const formattedData = formatDataForChart(data);
      chartInstanceRef.current.applyNewData(formattedData);
    } catch (error) {
      console.error('Failed to update chart data:', error);
    }
  }, [data, isChartReady, formatDataForChart]);

  // Update Bollinger Bands indicator
  useEffect(() => {
    if (!isChartReady || !chartInstanceRef.current || !data.length) return;

    try {
      const chart = chartInstanceRef.current;
      
      // Calculate Bollinger Bands using the exact formulas:
      // Basis (middle band) = SMA(source, length)
      // StdDev = sample standard deviation of the last length values of source
      // Upper = Basis + (StdDev multiplier * StdDev)
      // Lower = Basis - (StdDev multiplier * StdDev)
      // Offset: shift the three series by offset bars on the chart
      const bollingerResults = computeBollingerBands(data, bollingerConfig.settings);
      
      // Notify parent component
      if (onBollingerUpdate) {
        onBollingerUpdate(bollingerResults);
      }

      // Clear existing overlays first
      try {
        chart.removeOverlay();
      } catch (e) {
        // Ignore if no overlays exist
      }

      // Create Bollinger Bands overlays if any band is visible
      if (bollingerConfig.style.basis.visible || bollingerConfig.style.upper.visible || bollingerConfig.style.lower.visible) {
        
        // Add Basis line (middle band)
        if (bollingerConfig.style.basis.visible) {
          const basisPoints = bollingerResults
            .filter(result => !isNaN(result.basis))
            .map((result, index) => ({
              dataIndex: index,
              value: result.basis
            }));

          if (basisPoints.length > 0) {
            try {
              chart.createOverlay({
                name: 'priceLine',
                id: 'bollinger_basis',
                points: [{ value: basisPoints[basisPoints.length - 1].value }],
                styles: {
                  line: {
                    color: bollingerConfig.style.basis.color,
                    size: bollingerConfig.style.basis.lineWidth
                  }
                }
              });
            } catch (e) {
              console.warn('Could not create basis line overlay:', e);
            }
          }
        }

        // Add Upper band
        if (bollingerConfig.style.upper.visible) {
          const upperPoints = bollingerResults
            .filter(result => !isNaN(result.upper))
            .map((result, index) => ({
              dataIndex: index,
              value: result.upper
            }));

          if (upperPoints.length > 0) {
            try {
              chart.createOverlay({
                name: 'priceLine',
                id: 'bollinger_upper',
                points: [{ value: upperPoints[upperPoints.length - 1].value }],
                styles: {
                  line: {
                    color: bollingerConfig.style.upper.color,
                    size: bollingerConfig.style.upper.lineWidth
                  }
                }
              });
            } catch (e) {
              console.warn('Could not create upper band overlay:', e);
            }
          }
        }

        // Add Lower band
        if (bollingerConfig.style.lower.visible) {
          const lowerPoints = bollingerResults
            .filter(result => !isNaN(result.lower))
            .map((result, index) => ({
              dataIndex: index,
              value: result.lower
            }));

          if (lowerPoints.length > 0) {
            try {
              chart.createOverlay({
                name: 'priceLine',
                id: 'bollinger_lower',
                points: [{ value: lowerPoints[lowerPoints.length - 1].value }],
                styles: {
                  line: {
                    color: bollingerConfig.style.lower.color,
                    size: bollingerConfig.style.lower.lineWidth
                  }
                }
              });
            } catch (e) {
              console.warn('Could not create lower band overlay:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update Bollinger Bands:', error);
    }
  }, [data, bollingerConfig, isChartReady, onBollingerUpdate]);

  return (
    <div className="w-full h-full">
      <div
        ref={chartRef}
        className="w-full h-full chart-container bg-background"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};

export default Chart;