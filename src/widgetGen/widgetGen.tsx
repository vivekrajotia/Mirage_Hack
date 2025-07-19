'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, X, Trash2, Bot, Sparkles, MessageSquare, Send, Loader2 } from 'lucide-react';
import eodData from '@/app/xceler_eodservice_publisheddata (1).json'; // Use the correct data file
import { DraggableColumnSelector } from '@/components/ui/draggable-column-selector';
import { useToast } from '@/hooks/use-toast';
import ToastBanner from '@/components/toast-banner';
import { AIInsightsService } from '@/lib/ai-insights-service';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Define the type based on the JSON data structure
type EodData = typeof eodData[0];

const WIDGET_TYPES = ['Bar Chart', 'Line Chart', 'Pie Chart', 'Scatter Chart', 'Data Table'];
const AGGREGATION_FUNCTIONS = ['sum', 'average', 'count', 'min', 'max'];
const FILTER_CONDITIONS = ['equals', 'does not equal', 'contains', 'does not contain', 'is greater than', 'is less than'];

// Helper functions for type inference
const isNumericValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

const isDateValue = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  // Regex to check for ISO 8601 format (e.g., "2024-01-01T12:00:00Z") or similar date formats
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value));
};

const getColumnType = (data: any[], columnKey: string): 'numeric' | 'date' | 'text' => {
  if (!data || data.length === 0) return 'text';
  
  const sampleSize = Math.min(20, data.length);
  let numericCount = 0;
  let dateCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const value = data[i]?.[columnKey];
    if (value !== null && value !== undefined && value !== '') {
      if (isNumericValue(value)) numericCount++;
      if (isDateValue(value)) dateCount++;
    }
  }

  if (numericCount > sampleSize / 2) return 'numeric';
  if (dateCount > sampleSize / 2) return 'date';
  return 'text';
};

const ALL_EOD_FIELDS = Object.keys(eodData[0] || {});

const fieldTypes = ALL_EOD_FIELDS.reduce((acc, field) => {
  acc[field] = getColumnType(eodData, field);
  return acc;
}, {} as Record<string, 'numeric' | 'date' | 'text'>);

const NUMERIC_FIELDS = ALL_EOD_FIELDS.filter(f => fieldTypes[f] === 'numeric');
const TEXT_FIELDS = ALL_EOD_FIELDS.filter(f => fieldTypes[f] === 'text');
const DATE_FIELDS = ALL_EOD_FIELDS.filter(f => fieldTypes[f] === 'date');

interface Filter {
  id: number;
  field: string;
  condition: string;
  value: string;
}

interface WidgetConfig {
  title: string;
  type: string;
  xAxis: string;
  yAxis: string;
  colorBy: string;
  valueField: string;
  aggregation: string;
  filters: Filter[];
  selectedColumns: string[];
}

const WidgetGenerator = () => {
  const allTableColumns = useMemo(() => Object.keys(eodData[0] || {}), []);
  const { toast } = useToast();
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([]);

  const [config, setConfig] = useState<WidgetConfig>({
    title: 'New EOD Widget',
    type: WIDGET_TYPES[0],
    xAxis: [...TEXT_FIELDS, ...DATE_FIELDS][0] || '',
    yAxis: NUMERIC_FIELDS[0] || '',
    colorBy: '',
    valueField: NUMERIC_FIELDS[0] || '',
    aggregation: AGGREGATION_FUNCTIONS[0],
    filters: [],
    selectedColumns: [],
  });
  const [nextFilterId, setNextFilterId] = useState(1);

  const handleConfigChange = (field: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addFilter = () => {
    const newFilter: Filter = {
      id: nextFilterId,
      field: ALL_EOD_FIELDS[0],
      condition: FILTER_CONDITIONS[0],
      value: '',
    };
    handleConfigChange('filters', [...config.filters, newFilter]);
    setNextFilterId(prev => prev + 1);
  };

  const removeFilter = (id: number) => {
    const updatedFilters = config.filters.filter(f => f.id !== id);
    handleConfigChange('filters', updatedFilters);
  };

  const handleFilterChange = (id: number, field: keyof Filter, value: string) => {
    const updatedFilters = config.filters.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    );
    handleConfigChange('filters', updatedFilters);
  };

  const generateWidget = () => {
    console.log('Generated Widget Config:', JSON.stringify(config, null, 2));
    setBanner({ type: 'info', message: 'Widget configuration logged. See console for integration details.' });
  };

  const handlePreview = () => {
    localStorage.setItem('widgetPreviewConfig', JSON.stringify(config));
    window.open('/graph-engine-demo', '_blank');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setBanner({ type: 'success', message: 'Widget saved successfully!' });
      } else {
        const errorData = await response.json();
        setBanner({ type: 'error', message: `Failed to save widget: ${errorData.message}` });
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      setBanner({ type: 'error', message: 'An error occurred while saving the widget.' });
    }
  };

  const handleAIChat = async () => {
    if (!aiChatInput.trim() || isAILoading) return;

    const userMessage = aiChatInput.trim();
    setAiChatInput('');
    setIsAILoading(true);

    // Add user message to chat history
    setAiChatHistory(prev => [...prev, {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    }]);

    try {
      // Call AI service to generate widget configuration
      const response = await AIInsightsService.generateWidgetFromPrompt(userMessage, eodData);
      
      // Apply the AI-generated configuration
      if (response.type === 'widget' && response.widgetConfig) {
        const aiConfig = response.widgetConfig;
        
        // Convert AI response to our widget config format
        const newConfig: WidgetConfig = {
          title: aiConfig.title || 'AI Generated Widget',
          type: aiConfig.type || 'Bar Chart',
          xAxis: aiConfig.xAxis || config.xAxis,
          yAxis: aiConfig.yAxis || config.yAxis,
          colorBy: aiConfig.colorBy || '',
          valueField: aiConfig.valueField || config.valueField,
          aggregation: aiConfig.aggregation || 'sum',
          filters: (aiConfig.filters || []).map((filter, index) => ({
            id: nextFilterId + index,
            field: filter.field,
            condition: filter.condition,
            value: filter.value
          })),
          selectedColumns: aiConfig.selectedColumns || []
        };

        setConfig(newConfig);
        setNextFilterId(prev => prev + (aiConfig.filters?.length || 0));

        // Add AI response to chat history
        setAiChatHistory(prev => [...prev, {
          type: 'ai',
          message: `✅ ${response.explanation}\n\nI've configured a ${aiConfig.type} widget for you. You can review and modify the settings below, then save when ready.`,
          timestamp: new Date()
        }]);

        setBanner({ 
          type: 'success', 
          message: `AI generated widget: ${aiConfig.title}` 
        });
      }
    } catch (error) {
      console.error('AI widget generation failed:', error);
      
      // Add error message to chat history
      setAiChatHistory(prev => [...prev, {
        type: 'ai',
        message: `❌ Sorry, I couldn't generate a widget from that request. Please try being more specific about what you want to visualize. For example:
        
• "Create a bar chart showing PnL by commodity"
• "Make a line chart of price trends over time"  
• "Show a pie chart of profit distribution by trader"
• "Create a table with only profitable trades"`,
        timestamp: new Date()
      }]);

      setBanner({ 
        type: 'error', 
        message: 'Failed to generate widget from AI prompt' 
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAIChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIChat();
    }
  };

  const clearAIChat = () => {
    setAiChatHistory([]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">
            EOD Widget Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* AI Chat Interface */}
          <Collapsible open={isAIChatOpen} onOpenChange={setIsAIChatOpen}>
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-purple-200 hover:border-purple-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bot className="h-6 w-6 text-purple-600" />
                      <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-700">AI Widget Assistant</h3>
                      <p className="text-sm text-purple-600">
                        Describe what you want to visualize and I'll create it for you
                      </p>
                    </div>
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-purple-700">AI Chat</CardTitle>
                    {aiChatHistory.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAIChat}>
                        Clear Chat
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat History */}
                  {aiChatHistory.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-3 p-3 bg-white rounded-lg border">
                      {aiChatHistory.map((message, index) => (
                        <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Describe the widget you want to create... (e.g., 'Show PnL by commodity as a bar chart')"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      onKeyPress={handleAIChatKeyPress}
                      className="flex-1 min-h-[80px]"
                      disabled={isAILoading}
                    />
                    <Button 
                      onClick={handleAIChat}
                      disabled={!aiChatInput.trim() || isAILoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isAILoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Example Prompts */}
                  <div className="text-sm">
                    <p className="font-medium text-purple-700 mb-2">Try these examples:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Show PnL by commodity as a bar chart",
                        "Create a line chart of price trends over time",
                        "Make a pie chart showing profit distribution by trader", 
                        "Show a table with only profitable trades"
                      ].map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setAiChatInput(example)}
                          disabled={isAILoading}
                          className="text-left p-2 rounded border border-purple-200 hover:bg-purple-100 transition-colors text-purple-600 text-xs"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">1. Basic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={config.title}
                  onChange={e => handleConfigChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="widget-type">Widget Type</Label>
                <Select
                  value={config.type}
                  onValueChange={value => handleConfigChange('type', value)}
                >
                  <SelectTrigger id="widget-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDGET_TYPES.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Configuration */}
          {config.type === 'Data Table' ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">2. Column Selection</h3>
              <DraggableColumnSelector
                allColumns={allTableColumns}
                selectedColumns={config.selectedColumns}
                onSelectedColumnsChange={(newColumns) =>
                  handleConfigChange('selectedColumns', newColumns)
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">2. Data & Axes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="x-axis">X-Axis (Category)</Label>
                  <Select
                    value={config.xAxis}
                    onValueChange={value => handleConfigChange('xAxis', value)}
                  >
                    <SelectTrigger id="x-axis" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...TEXT_FIELDS, ...DATE_FIELDS].map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="y-axis">Y-Axis (Value)</Label>
                  <Select
                    value={config.yAxis}
                    onValueChange={value => handleConfigChange('yAxis', value)}
                  >
                    <SelectTrigger id="y-axis" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NUMERIC_FIELDS.map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color-by">Color By (Legend)</Label>
                  <Select
                    value={config.colorBy}
                    onValueChange={value => handleConfigChange('colorBy', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger id="color-by" className="mt-1">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <em>None</em>
                      </SelectItem>
                      {[...TEXT_FIELDS, ...DATE_FIELDS].map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="value-field">
                    Value Field (for Pies/Totals)
                  </Label>
                  <Select
                    value={config.valueField}
                    onValueChange={value => handleConfigChange('valueField', value)}
                  >
                    <SelectTrigger id="value-field" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NUMERIC_FIELDS.map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="aggregation">Aggregation</Label>
                  <Select
                    value={config.aggregation}
                    onValueChange={value => handleConfigChange('aggregation', value)}
                  >
                    <SelectTrigger id="aggregation" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGGREGATION_FUNCTIONS.map((func: string) => (
                        <SelectItem key={func} value={func}>
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Filtering Rules */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-700">3. Filters</h3>
              <Button variant="outline" size="sm" onClick={addFilter}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Filter
              </Button>
            </div>
            <div className="space-y-4">
              {config.filters.map(filter => (
                <div key={filter.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <Select
                      value={filter.field}
                      onValueChange={value => handleFilterChange(filter.id, 'field', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_EOD_FIELDS.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.condition}
                      onValueChange={value => handleFilterChange(filter.id, 'condition', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FILTER_CONDITIONS.map((cond: string) => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={filter.value}
                      onChange={e => handleFilterChange(filter.id, 'value', e.target.value)}
                      placeholder="Value"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button onClick={handleSave}>Save Widget</Button>
        </CardFooter>
      </Card>
      {banner && (
        <ToastBanner
          type={banner.type}
          message={banner.message}
          onClose={() => setBanner(null)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default WidgetGenerator;
