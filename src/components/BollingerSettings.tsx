import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { BollingerBandsConfig, DEFAULT_BOLLINGER_SETTINGS, DEFAULT_BOLLINGER_STYLE } from '@/lib/types';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => (
  <div className="flex items-center gap-2">
    <div 
      className="w-6 h-6 border border-border rounded cursor-pointer"
      style={{ backgroundColor: color }}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = color;
        input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
        input.click();
      }}
    />
    <span className="text-sm text-foreground">{label}</span>
  </div>
);

interface LineStyleButtonProps {
  style: 'solid' | 'dashed';
  isActive: boolean;
  onClick: () => void;
}

const LineStyleButton: React.FC<LineStyleButtonProps> = ({ style, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-8 h-8 border rounded flex items-center justify-center transition-colors ${
      isActive 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-primary/50'
    }`}
  >
    <div className={`w-4 h-0.5 ${style === 'dashed' ? 'border-t border-dashed' : 'bg-current'}`} />
  </button>
);

interface BollingerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: BollingerBandsConfig;
  onChange: (config: BollingerBandsConfig) => void;
}

const BollingerSettings: React.FC<BollingerSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const [localConfig, setLocalConfig] = useState<BollingerBandsConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleInputsChange = (field: keyof typeof localConfig.settings, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const handleStyleChange = (
    band: keyof typeof localConfig.style,
    field?: string,
    value?: any
  ) => {
    if (band === 'backgroundFill') {
      setLocalConfig(prev => ({
        ...prev,
        style: {
          ...prev.style,
          backgroundFill: {
            ...prev.style.backgroundFill,
            [field!]: value,
          },
        },
      }));
    } else {
      setLocalConfig(prev => ({
        ...prev,
        style: {
          ...prev.style,
          [band]: {
            ...prev.style[band as keyof Omit<typeof prev.style, 'backgroundFill'>],
            [field!]: value,
          },
        },
      }));
    }
  };

  const handleApply = () => {
    onChange(localConfig);
    onClose();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    onClose();
  };

  const handleDefaults = () => {
    const defaultConfig: BollingerBandsConfig = {
      settings: DEFAULT_BOLLINGER_SETTINGS,
      style: DEFAULT_BOLLINGER_STYLE,
    };
    setLocalConfig(defaultConfig);
    onChange(defaultConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Bollinger Bands Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="inputs" className="text-foreground">Inputs</TabsTrigger>
            <TabsTrigger value="style" className="text-foreground">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inputs" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="length" className="text-foreground">Length</Label>
              <Input
                id="length"
                type="number"
                value={localConfig.settings.length}
                onChange={(e) => handleInputsChange('length', parseInt(e.target.value) || 20)}
                className="bg-input border-border text-foreground"
                min="2"
                max="200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maType" className="text-foreground">Basic MA Type</Label>
              <Select value={localConfig.settings.maType} onValueChange={(value) => handleInputsChange('maType', value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="SMA" className="text-popover-foreground">SMA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source" className="text-foreground">Source</Label>
              <Select value={localConfig.settings.source} onValueChange={(value) => handleInputsChange('source', value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="close" className="text-popover-foreground">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stdDev" className="text-foreground">StdDev</Label>
              <Input
                id="stdDev"
                type="number"
                value={localConfig.settings.stdDev}
                onChange={(e) => handleInputsChange('stdDev', parseFloat(e.target.value) || 2)}
                className="bg-input border-border text-foreground"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="offset" className="text-foreground">Offset</Label>
              <Input
                id="offset"
                type="number"
                value={localConfig.settings.offset}
                onChange={(e) => handleInputsChange('offset', parseInt(e.target.value) || 0)}
                className="bg-input border-border text-foreground"
                min="-100"
                max="100"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-6 mt-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">OUTPUT VALUES</div>
            
            {/* Basis Line */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={localConfig.style.basis.visible}
                    onCheckedChange={(checked) => handleStyleChange('basis', 'visible', checked)}
                    className="border-border"
                  />
                  <ColorPicker
                    color={localConfig.style.basis.color}
                    onChange={(color) => handleStyleChange('basis', 'color', color)}
                    label="Basis"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localConfig.style.basis.lineWidth}
                    onChange={(e) => handleStyleChange('basis', 'lineWidth', parseInt(e.target.value) || 1)}
                    className="w-16 h-8 bg-input border-border text-foreground"
                    min="1"
                    max="5"
                  />
                  <LineStyleButton
                    style="solid"
                    isActive={localConfig.style.basis.lineStyle === 'solid'}
                    onClick={() => handleStyleChange('basis', 'lineStyle', 'solid')}
                  />
                  <LineStyleButton
                    style="dashed"
                    isActive={localConfig.style.basis.lineStyle === 'dashed'}
                    onClick={() => handleStyleChange('basis', 'lineStyle', 'dashed')}
                  />
                </div>
              </div>
            </div>
            
            {/* Upper Line */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={localConfig.style.upper.visible}
                    onCheckedChange={(checked) => handleStyleChange('upper', 'visible', checked)}
                    className="border-border"
                  />
                  <ColorPicker
                    color={localConfig.style.upper.color}
                    onChange={(color) => handleStyleChange('upper', 'color', color)}
                    label="Upper"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localConfig.style.upper.lineWidth}
                    onChange={(e) => handleStyleChange('upper', 'lineWidth', parseInt(e.target.value) || 1)}
                    className="w-16 h-8 bg-input border-border text-foreground"
                    min="1"
                    max="5"
                  />
                  <LineStyleButton
                    style="solid"
                    isActive={localConfig.style.upper.lineStyle === 'solid'}
                    onClick={() => handleStyleChange('upper', 'lineStyle', 'solid')}
                  />
                  <LineStyleButton
                    style="dashed"
                    isActive={localConfig.style.upper.lineStyle === 'dashed'}
                    onClick={() => handleStyleChange('upper', 'lineStyle', 'dashed')}
                  />
                </div>
              </div>
            </div>
            
            {/* Lower Line */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={localConfig.style.lower.visible}
                    onCheckedChange={(checked) => handleStyleChange('lower', 'visible', checked)}
                    className="border-border"
                  />
                  <ColorPicker
                    color={localConfig.style.lower.color}
                    onChange={(color) => handleStyleChange('lower', 'color', color)}
                    label="Lower"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localConfig.style.lower.lineWidth}
                    onChange={(e) => handleStyleChange('lower', 'lineWidth', parseInt(e.target.value) || 1)}
                    className="w-16 h-8 bg-input border-border text-foreground"
                    min="1"
                    max="5"
                  />
                  <LineStyleButton
                    style="solid"
                    isActive={localConfig.style.lower.lineStyle === 'solid'}
                    onClick={() => handleStyleChange('lower', 'lineStyle', 'solid')}
                  />
                  <LineStyleButton
                    style="dashed"
                    isActive={localConfig.style.lower.lineStyle === 'dashed'}
                    onClick={() => handleStyleChange('lower', 'lineStyle', 'dashed')}
                  />
                </div>
              </div>
            </div>
            
            {/* Background Fill */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={localConfig.style.backgroundFill.visible}
                  onCheckedChange={(checked) => handleStyleChange('backgroundFill', 'visible', checked)}
                  className="border-border"
                />
                <span className="text-sm text-foreground">Background</span>
              </div>
              {localConfig.style.backgroundFill.visible && (
                <div className="ml-7">
                  <Label className="text-foreground text-xs">Opacity</Label>
                  <Slider
                    value={[localConfig.style.backgroundFill.opacity * 100]}
                    onValueChange={(value) => handleStyleChange('backgroundFill', 'opacity', value[0] / 100)}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(localConfig.style.backgroundFill.opacity * 100)}%
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Select onValueChange={handleDefaults}>
            <SelectTrigger className="w-24 h-8 bg-input border-border text-foreground">
              <SelectValue placeholder="Defaults" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="defaults" className="text-popover-foreground">Defaults</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCancel} className="bg-secondary text-secondary-foreground">
              Cancel
            </Button>
            <Button onClick={handleApply} className="bg-primary text-primary-foreground">
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BollingerSettings;