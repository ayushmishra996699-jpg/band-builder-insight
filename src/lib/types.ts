// Trading data types and interfaces

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBandsSettings {
  length: number;
  maType: 'SMA';
  source: 'close';
  stdDev: number;
  offset: number;
}

export interface BollingerBandsStyle {
  basis: {
    visible: boolean;
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed';
  };
  upper: {
    visible: boolean;
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed';
  };
  lower: {
    visible: boolean;
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed';
  };
  backgroundFill: {
    visible: boolean;
    opacity: number;
  };
}

export interface BollingerBandsResult {
  timestamp: number;
  basis: number;
  upper: number;
  lower: number;
}

export interface BollingerBandsConfig {
  settings: BollingerBandsSettings;
  style: BollingerBandsStyle;
}

// Default configurations
export const DEFAULT_BOLLINGER_SETTINGS: BollingerBandsSettings = {
  length: 20,
  maType: 'SMA',
  source: 'close',
  stdDev: 2,
  offset: 0,
};

export const DEFAULT_BOLLINGER_STYLE: BollingerBandsStyle = {
  basis: {
    visible: true,
    color: '#0066ff',
    lineWidth: 1,
    lineStyle: 'solid',
  },
  upper: {
    visible: true,
    color: '#ff3333',
    lineWidth: 1,
    lineStyle: 'solid',
  },
  lower: {
    visible: true,
    color: '#009688',
    lineWidth: 1,
    lineStyle: 'solid',
  },
  backgroundFill: {
    visible: true,
    opacity: 0.1,
  },
};