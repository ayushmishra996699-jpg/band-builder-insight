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
      // Calculate Bollinger Bands
      const bollingerResults = computeBollingerBands(data, bollingerConfig.settings);
      
      // Notify parent component
      if (onBollingerUpdate) {
        onBollingerUpdate(bollingerResults);
      }

      // For now, we'll just calculate the bands and notify the parent
      // The visual rendering will be simplified
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