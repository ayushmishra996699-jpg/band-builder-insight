import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import Chart from '@/components/Chart';
import BollingerSettings from '@/components/BollingerSettings';
import { 
  OHLCVData, 
  BollingerBandsConfig, 
  BollingerBandsResult,
  DEFAULT_BOLLINGER_SETTINGS,
  DEFAULT_BOLLINGER_STYLE 
} from '@/lib/types';

const Index = () => {
  const [ohlcvData, setOHLCVData] = useState<OHLCVData[]>([]);
  const [bollingerConfig, setBollingerConfig] = useState<BollingerBandsConfig>({
    settings: DEFAULT_BOLLINGER_SETTINGS,
    style: DEFAULT_BOLLINGER_STYLE,
  });
  const [bollingerResults, setBollingerResults] = useState<BollingerBandsResult[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIndicatorAdded, setIsIndicatorAdded] = useState(false);

  // Load demo data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/ohlcv.json');
        const data = await response.json();
        setOHLCVData(data);
      } catch (error) {
        console.error('Failed to load OHLCV data:', error);
      }
    };

    loadData();
  }, []);

  const handleAddIndicator = () => {
    setIsIndicatorAdded(true);
    setIsSettingsOpen(true);
  };

  const handleBollingerUpdate = (results: BollingerBandsResult[]) => {
    setBollingerResults(results);
  };

  const handleConfigChange = (newConfig: BollingerBandsConfig) => {
    setBollingerConfig(newConfig);
  };

  const currentPrice = ohlcvData.length > 0 ? ohlcvData[ohlcvData.length - 1].close : 0;
  const currentBollinger = bollingerResults.length > 0 ? bollingerResults[bollingerResults.length - 1] : null;

  return (
    <div className="min-h-screen bg-financial-gradient text-foreground">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">FindScan Trading Dashboard</h1>
            </div>
            
            {/* Trading Action Buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-trading-buy text-white hover:bg-trading-buy/80">
                BUY
              </Button>
              <Button size="sm" className="bg-trading-sell text-white hover:bg-trading-sell/80">
                SELL
              </Button>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">NIFTY 50</div>
              <div className="text-lg font-bold price-pulse">
                ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-12 h-6 bg-trading-sell flex items-center justify-center text-xs text-white font-bold rounded">
              LIVE
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <TrendingUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Activity className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Chart Controls */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Indicators:</span>
                {!isIndicatorAdded ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddIndicator}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    + Bollinger Bands
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      Bollinger Bands ({bollingerConfig.settings.length}, {bollingerConfig.settings.stdDev})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Current Bollinger Values */}
              {currentBollinger && isIndicatorAdded && (
                <div className="flex items-center gap-4 ml-auto text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bollingerConfig.style.upper.color }} />
                    <span className="text-muted-foreground">Upper:</span>
                    <span className="font-mono">₹{currentBollinger.upper.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bollingerConfig.style.basis.color }} />
                    <span className="text-muted-foreground">Basis:</span>
                    <span className="font-mono">₹{currentBollinger.basis.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bollingerConfig.style.lower.color }} />
                    <span className="text-muted-foreground">Lower:</span>
                    <span className="font-mono">₹{currentBollinger.lower.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 p-4">
            <div className="w-full h-full bg-card rounded-lg border border-border overflow-hidden">
              {ohlcvData.length > 0 ? (
                <Chart
                  data={ohlcvData}
                  bollingerConfig={isIndicatorAdded ? bollingerConfig : {
                    settings: DEFAULT_BOLLINGER_SETTINGS,
                    style: {
                      ...DEFAULT_BOLLINGER_STYLE,
                      basis: { ...DEFAULT_BOLLINGER_STYLE.basis, visible: false },
                      upper: { ...DEFAULT_BOLLINGER_STYLE.upper, visible: false },
                      lower: { ...DEFAULT_BOLLINGER_STYLE.lower, visible: false },
                    }
                  }}
                  onBollingerUpdate={handleBollingerUpdate}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="text-lg font-semibold mb-2">Loading Chart Data...</div>
                    <div className="text-muted-foreground">Preparing NIFTY 50 candlestick data</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="bg-card border-t border-border p-4">
            <div className="flex items-center justify-center gap-6">
              {['1D', '5D', '1M', '3M', '6M', '1Y'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={timeframe === '1D' ? 'default' : 'ghost'}
                  size="sm"
                  className={timeframe === '1D' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <BollingerSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={bollingerConfig}
        onChange={handleConfigChange}
      />
    </div>
  );
};

export default Index;