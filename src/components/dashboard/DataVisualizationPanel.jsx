import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  Select,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Tag,
  Tooltip,
  Alert,
  Drawer,
  List,
  Checkbox,
  Input,
  Collapse,
  Empty,
  Spin
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  CloseOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  DragOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  NumberOutlined,
  CalendarOutlined,
  FontSizeOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import './DataVisualizationPanel.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Aggregation functions for values
const AGGREGATION_FUNCTIONS = [
  { value: 'sum', label: 'Sum', icon: '∑' },
  { value: 'count', label: 'Count', icon: '#' },
  { value: 'average', label: 'Average', icon: 'x̄' },
  { value: 'min', label: 'Min', icon: '↓' },
  { value: 'max', label: 'Max', icon: '↑' },
  { value: 'product', label: 'Product', icon: '∏' }
];

// Excel-like color scheme
const EXCEL_COLORS = [
  '#5B9BD5', // Blue
  '#70AD47', // Green  
  '#FFC000', // Yellow
  '#FF6B6B', // Red
  '#9966CC', // Purple
  '#4ECDC4', // Teal
  '#FF8C42', // Orange
  '#A8E6CF', // Light Green
  '#FFB3BA', // Light Pink
  '#BFBFBF'  // Gray
];

const CHART_TYPES = [
  { 
    value: 'column', 
    label: 'Column', 
    icon: <BarChartOutlined />,
    description: 'Compare values across categories',
    excelEquivalent: 'Column Chart'
  },
  { 
    value: 'line', 
    label: 'Line', 
    icon: <LineChartOutlined />,
    description: 'Show trends over time',
    excelEquivalent: 'Line Chart'
  },
  { 
    value: 'pie', 
    label: 'Pie', 
    icon: <PieChartOutlined />,
    description: 'Show parts of a whole',
    excelEquivalent: 'Pie Chart'
  },
  { 
    value: 'area', 
    label: 'Area', 
    icon: <AreaChartOutlined />,
    description: 'Show cumulative totals',
    excelEquivalent: 'Area Chart'
  },
  { 
    value: 'scatter', 
    label: 'Scatter', 
    icon: <DotChartOutlined />,
    description: 'Show correlation between variables',
    excelEquivalent: 'Scatter Chart'
  }
];

// Column chart sub-types
const COLUMN_SUBTYPES = [
  {
    value: 'clustered',
    label: 'Clustered Column',
    description: 'Compare values across categories side by side',
    icon: '📊'
  },
  {
    value: 'stacked',
    label: 'Stacked Column',
    description: 'Show parts of a whole stacked vertically',
    icon: '📈'
  },
  {
    value: 'stacked100',
    label: '100% Stacked Column',
    description: 'Show percentage contribution of each part',
    icon: '📉'
  },
  {
    value: 'bar-stack',
    label: 'Stacked Bar',
    description: 'Horizontal stacked bars for category comparison',
    icon: '📋'
  }
];

// Line chart sub-types
const LINE_SUBTYPES = [
  {
    value: 'basic',
    label: 'Basic Line',
    description: 'Simple line chart with data points',
    icon: '📈'
  },
  {
    value: 'smooth',
    label: 'Smooth Line',
    description: 'Curved line chart for smoother visualization',
    icon: '〰️'
  },
  {
    value: 'stepped',
    label: 'Stepped Line',
    description: 'Step-like line chart showing discrete changes',
    icon: '📊'
  },
  {
    value: 'dashed',
    label: 'Dashed Line',
    description: 'Line chart with dashed line style',
    icon: '➖'
  },
  {
    value: 'markers',
    label: 'Line with Markers',
    description: 'Line chart with emphasized data point markers',
    icon: '🔵'
  }
];

// Helper functions
const isNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

const isDateValue = (value) => {
  if (!value) return false;
  const str = String(value);
  
  // Check YYYYMM format
  if (/^\d{6}$/.test(str)) {
    const year = parseInt(str.substring(0, 4));
    const month = parseInt(str.substring(4, 6));
    return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
  }
  
  // Check YYYY format
  if (/^\d{4}$/.test(str)) {
    const year = parseInt(str);
    return year >= 1900 && year <= 2100;
  }
  
  // Check standard date formats
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
};

const formatDateValue = (value) => {
  const str = String(value);
  if (/^\d{6}$/.test(str)) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  return value;
};

const getColumnType = (data, columnKey) => {
  if (!data || data.length === 0) return 'text';
  
  const sampleSize = Math.min(10, data.length);
  let numericCount = 0;
  let dateCount = 0;
  let validCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const value = data[i]?.[columnKey];
    if (value !== null && value !== undefined && value !== '') {
      validCount++;
      if (isNumericValue(value)) numericCount++;
      if (isDateValue(value)) dateCount++;
    }
  }
  
  if (validCount === 0) return 'text';
  
  const numericRatio = numericCount / validCount;
  const dateRatio = dateCount / validCount;
  
  if (numericRatio >= 0.8) return 'numeric';
  if (dateRatio >= 0.8) return 'date';
  return 'text';
};

const DataVisualizationPanel = ({ data, columns, isVisible, onClose }) => {
  // State management
  const [chartType, setChartType] = useState('column');
  const [columnSubType, setColumnSubType] = useState('clustered');
  const [lineSubType, setLineSubType] = useState('basic');
  const [selectedFields, setSelectedFields] = useState({
    filters: [],
    legend: [],
    axis: [],
    values: []
  });
  const [chartTitle, setChartTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [aggregationFunctions, setAggregationFunctions] = useState({});
  const [draggedField, setDraggedField] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);

  // Enhanced column analysis
  const columnAnalysis = useMemo(() => {
    if (!data || !columns || data.length === 0) {
      return { numeric: [], date: [], text: [], all: [] };
    }

    const analysis = {
      numeric: [],
      date: [],
      text: [],
      all: []
    };

    columns.forEach(col => {
      const columnInfo = {
        key: col.accessorKey,
        header: col.header || col.accessorKey,
        type: getColumnType(data, col.accessorKey)
      };

      analysis.all.push(columnInfo);
      analysis[columnInfo.type].push(columnInfo);
    });

    return analysis;
  }, [data, columns]);

  // Get unique values for filter fields
  const filterOptions = useMemo(() => {
    if (!data || selectedFields.filters.length === 0) {
      return {};
    }

    const options = {};
    selectedFields.filters.forEach(field => {
      const uniqueValues = [...new Set(
        data
          .map(row => row[field])
          .filter(value => value !== null && value !== undefined && value !== '')
      )].sort();
      options[field] = uniqueValues;
    });

    return options;
  }, [data, selectedFields.filters]);

  // Data processing with Excel-like aggregation
  const processedData = useMemo(() => {
    if (!data || selectedFields.values.length === 0) {
      return [];
    }

    try {
      setError(null);
      let processedData = [...data];

      // Apply filters first
      selectedFields.filters.forEach(field => {
        const selectedValues = filterValues[field];
        if (selectedValues && selectedValues.length > 0) {
          processedData = processedData.filter(row => 
            selectedValues.includes(row[field])
          );
        }
      });

      // Filter out invalid rows
      processedData = processedData.filter(row => {
        return selectedFields.values.some(field => {
          const value = row[field];
          return value !== null && value !== undefined && value !== '' && isNumericValue(value);
        });
      });

      // Handle legend field grouping
      const legendField = selectedFields.legend[0];
      const axisField = selectedFields.axis[0];
      
      if (legendField && axisField) {
        // Group by both axis and legend fields
        const grouped = {};
        
        processedData.forEach(row => {
          const axisKey = row[axisField];
          const legendKey = row[legendField];
          
          if (axisKey !== null && axisKey !== undefined && axisKey !== '' &&
              legendKey !== null && legendKey !== undefined && legendKey !== '') {
            const compositeKey = `${axisKey}|${legendKey}`;
            if (!grouped[compositeKey]) {
              grouped[compositeKey] = {
                [axisField]: axisKey,
                [legendField]: legendKey,
                rows: []
              };
            }
            grouped[compositeKey].rows.push(row);
          }
        });

        // Create aggregated data with legend grouping
        const aggregatedData = {};
        
        Object.values(grouped).forEach(group => {
          const axisKey = group[axisField];
          const legendKey = group[legendField];
          
          if (!aggregatedData[axisKey]) {
            aggregatedData[axisKey] = { [axisField]: axisKey };
          }
          
          selectedFields.values.forEach(field => {
            const values = group.rows
              .map(row => Number(row[field]))
              .filter(val => !isNaN(val) && isFinite(val));
            
            if (values.length > 0) {
              const aggFunc = aggregationFunctions[field] || 'sum';
              let aggregatedValue = 0;
              
              switch (aggFunc) {
                case 'sum':
                  aggregatedValue = values.reduce((sum, val) => sum + val, 0);
                  break;
                case 'count':
                  aggregatedValue = values.length;
                  break;
                case 'average':
                  aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                  break;
                case 'min':
                  aggregatedValue = Math.min(...values);
                  break;
                case 'max':
                  aggregatedValue = Math.max(...values);
                  break;
                case 'product':
                  aggregatedValue = values.reduce((product, val) => product * val, 1);
                  break;
                default:
                  aggregatedValue = values.reduce((sum, val) => sum + val, 0);
              }
              
              // Create field name with legend suffix
              const fieldKey = `${field}_${legendKey}`;
              aggregatedData[axisKey][fieldKey] = aggregatedValue;
              
              // Store legend mapping for color assignment
              if (!aggregatedData[axisKey]._legendMapping) {
                aggregatedData[axisKey]._legendMapping = {};
              }
              aggregatedData[axisKey]._legendMapping[fieldKey] = legendKey;
            }
          });
        });
        
        processedData = Object.values(aggregatedData);
      } else if (axisField) {
        // Group by axis field only (original logic)
        const grouped = {};
        
        processedData.forEach(row => {
          const key = row[axisField];
          if (key !== null && key !== undefined && key !== '') {
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(row);
          }
        });

        processedData = Object.keys(grouped).map(key => {
          const group = grouped[key];
          const aggregated = { [axisField]: key };
          
          selectedFields.values.forEach(field => {
            const values = group
              .map(row => Number(row[field]))
              .filter(val => !isNaN(val) && isFinite(val));
            
            if (values.length > 0) {
              const aggFunc = aggregationFunctions[field] || 'sum';
              
              switch (aggFunc) {
                case 'sum':
                  aggregated[field] = values.reduce((sum, val) => sum + val, 0);
                  break;
                case 'count':
                  aggregated[field] = values.length;
                  break;
                case 'average':
                  aggregated[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
                  break;
                case 'min':
                  aggregated[field] = Math.min(...values);
                  break;
                case 'max':
                  aggregated[field] = Math.max(...values);
                  break;
                case 'product':
                  aggregated[field] = values.reduce((product, val) => product * val, 1);
                  break;
                default:
                  aggregated[field] = values.reduce((sum, val) => sum + val, 0);
              }
            } else {
              aggregated[field] = 0;
            }
          });
          
          return aggregated;
        });
      }

      // Sort data for better visualization
      if (selectedFields.axis.length > 0) {
        const axisField = selectedFields.axis[0];
        const axisType = getColumnType(data, axisField);
        
        if (axisType === 'date') {
          processedData.sort((a, b) => {
            const aVal = String(a[axisField]);
            const bVal = String(b[axisField]);
            return aVal.localeCompare(bVal);
          });
        } else if (axisType === 'numeric') {
          processedData.sort((a, b) => Number(a[axisField]) - Number(b[axisField]));
        }
      }

      // Limit data points for performance
      return processedData.slice(0, 100);
    } catch (err) {
      setError('Error processing data: ' + err.message);
      return [];
    }
  }, [data, selectedFields, filterValues, aggregationFunctions]);

  // Get unique legend values for color mapping
  const legendValues = useMemo(() => {
    if (!selectedFields.legend[0] || !data) return [];
    
    const legendField = selectedFields.legend[0];
    return [...new Set(
      data
        .map(row => row[legendField])
        .filter(value => value !== null && value !== undefined && value !== '')
    )].sort();
  }, [data, selectedFields.legend]);

  // Create color mapping for legend values
  const legendColorMap = useMemo(() => {
    const colorMap = {};
    legendValues.forEach((value, index) => {
      colorMap[value] = EXCEL_COLORS[index % EXCEL_COLORS.length];
    });
    return colorMap;
  }, [legendValues]);

  // Aggregation function change handler
  const handleAggregationChange = useCallback((field, aggFunction) => {
    setAggregationFunctions(prev => ({
      ...prev,
      [field]: aggFunction
    }));
  }, []);

  // Field management functions
  const addFieldToArea = useCallback((field, area) => {
    setSelectedFields(prev => {
      const newFields = { ...prev };
      
      // Remove field from other areas first
      Object.keys(newFields).forEach(key => {
        newFields[key] = newFields[key].filter(f => f !== field);
      });
      
      // Add to target area with validation
      if (area === 'values' && getColumnType(data, field) !== 'numeric') {
        setError('Values area only accepts numeric fields');
        return prev;
      }
      
      if (area === 'axis' && newFields.axis.length >= 1) {
        setError('Axis area accepts only one field');
        return prev;
      }
      
      if (area === 'legend' && newFields.legend.length >= 1) {
        setError('Legend area accepts only one field');
        return prev;
      }
      
      newFields[area] = [...newFields[area], field];
      
      // Set default aggregation for values area
      if (area === 'values') {
        setAggregationFunctions(prevAgg => ({
          ...prevAgg,
          [field]: prevAgg[field] || 'sum'
        }));
      }
      
      setError(null);
      return newFields;
    });
  }, [data]);

  const removeFieldFromArea = useCallback((field, area) => {
    setSelectedFields(prev => ({
      ...prev,
      [area]: prev[area].filter(f => f !== field)
    }));
    
    // Clear filter values when removing from filters area
    if (area === 'filters') {
      setFilterValues(prev => {
        const newValues = { ...prev };
        delete newValues[field];
        return newValues;
      });
    }
    
    // Clear aggregation functions when removing from values area
    if (area === 'values') {
      setAggregationFunctions(prev => {
        const newAgg = { ...prev };
        delete newAgg[field];
        return newAgg;
      });
    }
  }, []);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e, field) => {
    setDraggedField(field);
    e.dataTransfer.setData('text/plain', field);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, area) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverArea(area);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Only clear drag over if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverArea(null);
    }
  }, []);

  const handleDrop = useCallback((e, area) => {
    e.preventDefault();
    const field = e.dataTransfer.getData('text/plain');
    if (field && draggedField) {
      addFieldToArea(field, area);
    }
    setDraggedField(null);
    setDragOverArea(null);
  }, [draggedField, addFieldToArea]);

  const handleDragEnd = useCallback(() => {
    setDraggedField(null);
    setDragOverArea(null);
  }, []);

  // Chart rendering with Excel-like styling
  // ECharts configuration generator
  const getEChartsOption = () => {
    if (selectedFields.values.length === 0) {
      return null;
    }

    if (processedData.length === 0) {
      return null;
    }

    const axisField = selectedFields.axis[0];
    const isAxisDate = axisField && getColumnType(data, axisField) === 'date';
    
    // Prepare chart data
    const chartData = processedData.map(row => {
      const newRow = { ...row };
      if (isAxisDate) {
        newRow[`${axisField}_formatted`] = formatDateValue(row[axisField]);
      }
      return newRow;
    });

    const legendField = selectedFields.legend[0];
    
    // Base configuration
    const baseOption = {
      backgroundColor: '#ffffff',
      textStyle: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333',
          fontSize: 12
        },
        formatter: function(params) {
          let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
          params.forEach(param => {
            result += `<div style="margin: 2px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px;"></span>
              ${param.seriesName}: <strong>${typeof param.value === 'number' ? param.value.toLocaleString() : param.value}</strong>
            </div>`;
          });
          return result;
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 10,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Save as Image',
            backgroundColor: '#fff'
          },
          dataZoom: {
            title: {
              zoom: 'Zoom',
              back: 'Reset Zoom'
            }
          }
        },
        right: 20,
        top: 20
      }
    };

    const axisKey = isAxisDate ? `${axisField}_formatted` : axisField;

    switch (chartType) {
      case 'column': {
        const xAxisData = chartData.map(row => 
          isAxisDate ? formatDateValue(row[axisField]) : (row[axisKey] || row[axisField] || '')
        );
        
        let series = [];
        
        if (legendField) {
          // Group by legend field
          const allFieldKeys = [];
          chartData.forEach(row => {
            Object.keys(row).forEach(key => {
              if (key.includes('_') && selectedFields.values.some(field => key.startsWith(field + '_'))) {
                if (!allFieldKeys.includes(key)) {
                  allFieldKeys.push(key);
                }
              }
            });
          });
          
          series = allFieldKeys.map((fieldKey, index) => {
            const originalField = selectedFields.values.find(field => fieldKey.startsWith(field + '_'));
            const legendValue = fieldKey.substring(originalField.length + 1);
            const fieldHeader = columnAnalysis.all.find(col => col.key === originalField)?.header || originalField;
            const aggFunc = aggregationFunctions[originalField] || 'sum';
            const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
            const color = legendColorMap[legendValue] || EXCEL_COLORS[index % EXCEL_COLORS.length];
            
            const seriesConfig = {
              name: `${legendValue} - ${aggLabel} of ${fieldHeader}`,
              type: columnSubType === 'bar-stack' ? 'bar' : 'bar',
              data: chartData.map(row => row[fieldKey] || 0),
              itemStyle: {
                color: color,
                borderRadius: [2, 2, 0, 0]
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              }
            };
            
            // Apply stacking based on column sub-type
            if (columnSubType === 'stacked' || columnSubType === 'stacked100' || columnSubType === 'bar-stack') {
              seriesConfig.stack = 'total';
            }
            
            return seriesConfig;
          });
        } else {
          series = selectedFields.values.map((field, index) => {
            const fieldHeader = columnAnalysis.all.find(col => col.key === field)?.header || field;
            const aggFunc = aggregationFunctions[field] || 'sum';
            const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
            
            const color = EXCEL_COLORS[index % EXCEL_COLORS.length];
            const seriesConfig = {
              name: `${aggLabel} of ${fieldHeader}`,
              type: columnSubType === 'bar-stack' ? 'bar' : 'bar',
              data: chartData.map(row => row[field] || 0),
              itemStyle: {
                color: color,
                borderRadius: [2, 2, 0, 0]
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              }
            };
            
            // Apply stacking based on column sub-type
            if (columnSubType === 'stacked' || columnSubType === 'stacked100' || columnSubType === 'bar-stack') {
              seriesConfig.stack = 'total';
            }
            
            return seriesConfig;
          });
        }
        
        const yAxisConfig = {
          type: 'value',
          axisLine: {
            lineStyle: { color: '#666' }
          },
          axisTick: {
            lineStyle: { color: '#666' }
          },
          axisLabel: {
            color: '#666',
            fontSize: 11
          },
          splitLine: {
            lineStyle: {
              color: '#e0e0e0',
              type: 'dashed'
            }
          }
        };
        
        // For 100% stacked, format as percentage
        if (columnSubType === 'stacked100') {
          yAxisConfig.axisLabel.formatter = '{value}%';
          yAxisConfig.max = 100;
          
          // Convert data to percentages
          const totalsByCategory = {};
          chartData.forEach((row, rowIndex) => {
            let total = 0;
            if (legendField) {
              Object.keys(row).forEach(key => {
                if (key.includes('_') && selectedFields.values.some(field => key.startsWith(field + '_'))) {
                  total += row[key] || 0;
                }
              });
            } else {
              selectedFields.values.forEach(field => {
                total += row[field] || 0;
              });
            }
            totalsByCategory[rowIndex] = total;
          });
          
          // Update series data to percentages
          series.forEach(seriesItem => {
            seriesItem.data = seriesItem.data.map((value, index) => {
              const total = totalsByCategory[index];
              return total > 0 ? Math.round((value / total) * 100 * 100) / 100 : 0;
            });
          });
        }
        
        // For bar-stack, swap axes to create horizontal bars
        if (columnSubType === 'bar-stack') {
          return {
            ...baseOption,
            xAxis: yAxisConfig,
            yAxis: {
              type: 'category',
              data: xAxisData,
              axisLine: {
                lineStyle: { color: '#666' }
              },
              axisTick: {
                lineStyle: { color: '#666' }
              },
              axisLabel: {
                color: '#666',
                fontSize: 11
              }
            },
            series
          };
        }
        
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
              lineStyle: { color: '#666' }
            },
            axisTick: {
              lineStyle: { color: '#666' }
            },
            axisLabel: {
              color: '#666',
              fontSize: 11,
              rotate: isAxisDate ? 45 : 0
            }
          },
          yAxis: yAxisConfig,
          series
        };
      }
      
      case 'line': {
        const xAxisData = chartData.map(row => 
          isAxisDate ? formatDateValue(row[axisField]) : (row[axisKey] || row[axisField] || '')
        );
        
        let series = [];
        
        if (legendField) {
          const allFieldKeys = [];
          chartData.forEach(row => {
            Object.keys(row).forEach(key => {
              if (key.includes('_') && selectedFields.values.some(field => key.startsWith(field + '_'))) {
                if (!allFieldKeys.includes(key)) {
                  allFieldKeys.push(key);
                }
              }
            });
          });
          
          series = allFieldKeys.map((fieldKey, index) => {
            const originalField = selectedFields.values.find(field => fieldKey.startsWith(field + '_'));
            const legendValue = fieldKey.substring(originalField.length + 1);
            const fieldHeader = columnAnalysis.all.find(col => col.key === originalField)?.header || originalField;
            const aggFunc = aggregationFunctions[originalField] || 'sum';
            const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
            const color = legendColorMap[legendValue] || EXCEL_COLORS[index % EXCEL_COLORS.length];
            
            // Configure line style based on sub-type
            const getLineConfig = () => {
              switch (lineSubType) {
                case 'smooth':
                  return {
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: { color: color, width: 2 }
                  };
                case 'stepped':
                  return {
                    step: 'middle',
                    symbol: 'rect',
                    symbolSize: 5,
                    lineStyle: { color: color, width: 2 }
                  };
                case 'dashed':
                  return {
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: { color: color, width: 2, type: 'dashed' }
                  };
                case 'markers':
                  return {
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { color: color, width: 1.5 },
                    emphasis: { symbolSize: 12 }
                  };
                default: // basic
                  return {
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: color, width: 2 }
                  };
              }
            };
            
            const lineConfig = getLineConfig();
            
            return {
              name: `${legendValue} - ${aggLabel} of ${fieldHeader}`,
              type: 'line',
              data: chartData.map(row => row[fieldKey] || 0),
              ...lineConfig,
              itemStyle: {
                color: color
              }
            };
          });
        } else {
          series = selectedFields.values.map((field, index) => {
            const fieldHeader = columnAnalysis.all.find(col => col.key === field)?.header || field;
            const aggFunc = aggregationFunctions[field] || 'sum';
            const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
            const color = EXCEL_COLORS[index % EXCEL_COLORS.length];
            
            // Configure line style based on sub-type
            const getLineConfig = () => {
              switch (lineSubType) {
                case 'smooth':
                  return {
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: { color: color, width: 2 }
                  };
                case 'stepped':
                  return {
                    step: 'middle',
                    symbol: 'rect',
                    symbolSize: 5,
                    lineStyle: { color: color, width: 2 }
                  };
                case 'dashed':
                  return {
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: { color: color, width: 2, type: 'dashed' }
                  };
                case 'markers':
                  return {
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: { color: color, width: 1.5 },
                    emphasis: { symbolSize: 12 }
                  };
                default: // basic
                  return {
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: color, width: 2 }
                  };
              }
            };
            
            const lineConfig = getLineConfig();
            
            return {
              name: `${aggLabel} of ${fieldHeader}`,
              type: 'line',
              data: chartData.map(row => row[field] || 0),
              ...lineConfig,
              itemStyle: {
                color: color
              }
            };
          });
        }
        
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
              lineStyle: { color: '#666' }
            },
            axisTick: {
              lineStyle: { color: '#666' }
            },
            axisLabel: {
              color: '#666',
              fontSize: 11,
              rotate: isAxisDate ? 45 : 0
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: { color: '#666' }
            },
            axisTick: {
              lineStyle: { color: '#666' }
            },
            axisLabel: {
              color: '#666',
              fontSize: 11
            },
            splitLine: {
              lineStyle: {
                color: '#e0e0e0',
                type: 'dashed'
              }
            }
          },
          series
        };
      }
      
      case 'area': {
        const xAxisData = chartData.map(row => 
          isAxisDate ? formatDateValue(row[axisField]) : (row[axisKey] || row[axisField] || '')
        );
        
        let series = [];
        
        if (legendField) {
          const allFieldKeys = [];
          chartData.forEach(row => {
            Object.keys(row).forEach(key => {
              if (key.includes('_') && selectedFields.values.some(field => key.startsWith(field + '_'))) {
                if (!allFieldKeys.includes(key)) {
                  allFieldKeys.push(key);
                }
              }
            });
          });
          
          series = allFieldKeys.map((fieldKey, index) => {
            const originalField = selectedFields.values.find(field => fieldKey.startsWith(field + '_'));
            const legendValue = fieldKey.substring(originalField.length + 1);
            const fieldHeader = columnAnalysis.all.find(col => col.key === originalField)?.header || originalField;
            const aggFunc = aggregationFunctions[originalField] || 'sum';
            const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
            const color = legendColorMap[legendValue] || EXCEL_COLORS[index % EXCEL_COLORS.length];
            
            return {
              name: `${legendValue} - ${aggLabel} of ${fieldHeader}`,
              type: 'line',
              data: chartData.map(row => row[fieldKey] || 0),
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: color
                  }, {
                    offset: 1,
                    color: echarts.color.modifyAlpha(color, 0.1)
                  }]
                }
              },
              lineStyle: {
                color: color,
                width: 2
              },
              itemStyle: {
                color: color
              },
              symbol: 'circle',
              symbolSize: 4,
              smooth: true,
              stack: 'total'
            };
          });
        } else {
          series = selectedFields.values.map((field, index) => {
            const fieldHeader = columnAnalysis.all.find(col => col.key === field)?.header || field;
            const aggFunc = aggregationFunctions[field] || 'sum';
            const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
            
            return {
              name: `${aggLabel} of ${fieldHeader}`,
              type: 'line',
              data: chartData.map(row => row[field] || 0),
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: EXCEL_COLORS[index % EXCEL_COLORS.length]
                  }, {
                    offset: 1,
                    color: echarts.color.modifyAlpha(EXCEL_COLORS[index % EXCEL_COLORS.length], 0.1)
                  }]
                }
              },
              lineStyle: {
                color: EXCEL_COLORS[index % EXCEL_COLORS.length],
                width: 2
              },
              itemStyle: {
                color: EXCEL_COLORS[index % EXCEL_COLORS.length]
              },
              symbol: 'circle',
              symbolSize: 4,
              smooth: true,
              stack: 'total'
            };
          });
        }
        
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: xAxisData,
            axisLine: {
              lineStyle: { color: '#666' }
            },
            axisTick: {
              lineStyle: { color: '#666' }
            },
            axisLabel: {
              color: '#666',
              fontSize: 11,
              rotate: isAxisDate ? 45 : 0
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: { color: '#666' }
            },
            axisTick: {
              lineStyle: { color: '#666' }
            },
            axisLabel: {
              color: '#666',
              fontSize: 11
            },
            splitLine: {
              lineStyle: {
                color: '#e0e0e0',
                type: 'dashed'
              }
            }
          },
          series
        };
      }
      
      case 'pie': {
        if (selectedFields.values.length > 1) {
          return null;
        }
        
        let pieData;
        if (legendField) {
          // When legend field is selected, create pie slices for each legend value
          pieData = [];
          chartData.forEach(item => {
            Object.keys(item).forEach(key => {
               if (key.includes('_') && selectedFields.values.some(field => key.startsWith(field + '_'))) {
                 // Find the original field that this key belongs to
                 const originalField = selectedFields.values.find(field => key.startsWith(field + '_'));
                 const legendValue = key.substring(originalField.length + 1); // Extract everything after 'field_'
                 const value = Number(item[key]) || 0;
                 if (value > 0) {
                   const color = legendColorMap[legendValue] || EXCEL_COLORS[pieData.length % EXCEL_COLORS.length];
                   pieData.push({
                     name: `${legendValue} - ${isAxisDate ? formatDateValue(item[axisField]) : (item[axisField] || 'Unknown')}`,
                     value: value,
                     itemStyle: {
                       color: color
                     }
                   });
                 }
               }
             });
          });
        } else {
          // Original logic without legend grouping
          pieData = chartData.map((item, index) => ({
            name: isAxisDate ? formatDateValue(item[axisField]) : (item[axisField] || 'Unknown'),
            value: Number(item[selectedFields.values[0]]) || 0,
            itemStyle: {
              color: EXCEL_COLORS[index % EXCEL_COLORS.length]
            }
          })).filter(item => item.value > 0);
        }
        
        return {
          ...baseOption,
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ccc',
            borderWidth: 1,
            textStyle: {
              color: '#333',
              fontSize: 12
            },
            formatter: '{b}: {c} ({d}%)'
          },
          series: [{
            name: selectedFields.values[0],
            type: 'pie',
            radius: ['0%', '70%'],
            center: ['50%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: function(params) {
                return params.percent > 5 ? `${params.name}\n${params.percent}%` : '';
              },
              fontSize: 11,
              color: '#666'
            },
            labelLine: {
              show: true
            }
          }]
        };
      }
      
      case 'scatter': {
        if (selectedFields.values.length !== 2) {
          return null;
        }
        
        let scatterData;
        if (legendField) {
          // Group scatter data by legend field
          const scatterDataByLegend = {};
          chartData.forEach(item => {
            const legendValue = item._legendMapping || 'Unknown';
            if (!scatterDataByLegend[legendValue]) {
              scatterDataByLegend[legendValue] = [];
            }
            
            // For scatter charts with legend, we need to use the original field values
            const xValue = Number(item[selectedFields.values[0]]) || 0;
            const yValue = Number(item[selectedFields.values[1]]) || 0;
            
            scatterDataByLegend[legendValue].push([xValue, yValue]);
          });
          
          const series = Object.entries(scatterDataByLegend).map(([legendValue, data], index) => {
            const color = legendColorMap[legendValue] || EXCEL_COLORS[index % EXCEL_COLORS.length];
            return {
              name: legendValue,
              type: 'scatter',
              data: data,
              itemStyle: {
                color: color
              },
              symbolSize: 8,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              }
            };
          });
          
          return {
            ...baseOption,
            xAxis: {
              type: 'value',
              name: columnAnalysis.all.find(col => col.key === selectedFields.values[0])?.header || selectedFields.values[0],
              nameLocation: 'middle',
              nameGap: 30,
              axisLine: {
                lineStyle: { color: '#666' }
              },
              axisTick: {
                lineStyle: { color: '#666' }
              },
              axisLabel: {
                color: '#666',
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: '#e0e0e0',
                  type: 'dashed'
                }
              }
            },
            yAxis: {
              type: 'value',
              name: columnAnalysis.all.find(col => col.key === selectedFields.values[1])?.header || selectedFields.values[1],
              nameLocation: 'middle',
              nameGap: 40,
              axisLine: {
                lineStyle: { color: '#666' }
              },
              axisTick: {
                lineStyle: { color: '#666' }
              },
              axisLabel: {
                color: '#666',
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: '#e0e0e0',
                  type: 'dashed'
                }
              }
            },
            series
          };
        } else {
          // Original logic without legend grouping
          const scatterData = chartData.map(row => [
            Number(row[selectedFields.values[0]]) || 0,
            Number(row[selectedFields.values[1]]) || 0
          ]);
          
          return {
            ...baseOption,
            xAxis: {
              type: 'value',
              name: columnAnalysis.all.find(col => col.key === selectedFields.values[0])?.header || selectedFields.values[0],
              nameLocation: 'middle',
              nameGap: 30,
              axisLine: {
                lineStyle: { color: '#666' }
              },
              axisTick: {
                lineStyle: { color: '#666' }
              },
              axisLabel: {
                color: '#666',
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: '#e0e0e0',
                  type: 'dashed'
                }
              }
            },
            yAxis: {
              type: 'value',
              name: columnAnalysis.all.find(col => col.key === selectedFields.values[1])?.header || selectedFields.values[1],
              nameLocation: 'middle',
              nameGap: 40,
              axisLine: {
                lineStyle: { color: '#666' }
              },
              axisTick: {
                lineStyle: { color: '#666' }
              },
              axisLabel: {
                color: '#666',
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: '#e0e0e0',
                  type: 'dashed'
                }
              }
            },
            series: [{
              name: 'Data Points',
              type: 'scatter',
              data: scatterData,
              itemStyle: {
                color: EXCEL_COLORS[0]
              },
              symbolSize: 8,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              }
            }]
          };
        }
      }
      
      default:
        return null;
    }
  };

  // Chart rendering with ECharts
  const renderChart = () => {
    if (selectedFields.values.length === 0) {
      return (
        <div className="excel-chart-placeholder">
          <Empty
            image={<BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <div>
                <Text strong>Create a Chart</Text>
                <br />
                <Text type="secondary">Drag fields to the areas below to create your chart</Text>
              </div>
            }
          />
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <Alert
          message="No Data Available"
          description="The selected fields don't contain valid data for visualization."
          type="warning"
          showIcon
        />
      );
    }

    // Special case validations for specific chart types
    if (chartType === 'pie' && selectedFields.values.length > 1) {
      return (
        <Alert
          message="Pie Chart Limitation"
          description="Pie charts can only display one value field. Please select only one field in the Values area."
          type="info"
          showIcon
        />
      );
    }

    if (chartType === 'scatter' && selectedFields.values.length !== 2) {
      return (
        <Alert
          message="Scatter Chart Requirements"
          description="Scatter charts require exactly two value fields for X and Y coordinates."
          type="info"
          showIcon
        />
      );
    }

    const option = getEChartsOption();
    
    if (!option) {
      return (
        <Alert
          message="Chart Configuration Error"
          description="Unable to generate chart configuration. Please check your field selections."
          type="error"
          showIcon
        />
      );
    }

    return (
      <div style={{ width: '100%', height: '400px' }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  };

  // Drag and drop handlers

  const removeField = (area, fieldToRemove) => {
    setSelectedFields(prev => ({
      ...prev,
      [area]: prev[area].filter(field => field !== fieldToRemove)
    }));
  };

  // Filter value change handler
  const handleFilterChange = useCallback((field, values) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: values
    }));
  }, []);

  // Reset function
  const resetChart = useCallback(() => {
    setSelectedFields({
      filters: [],
      legend: [],
      axis: [],
      values: []
    });
    setChartTitle('');
    setError(null);
    setFilterValues({});
    setAggregationFunctions({});
    setChartType('column');
    setColumnSubType('clustered');
    setLineSubType('basic');
  }, []);

  if (!isVisible) return null;

  return (
    <Drawer
      title={
        <Space>
          <BarChartOutlined />
          <span>Insert Chart</span>
        </Space>
      }
      placement="right"
      width={900}
      onClose={onClose}
      open={isVisible}
      className="excel-chart-drawer"
      extra={
        <Space>
          <Button icon={<CloseOutlined />} onClick={resetChart} size="small">
            Reset
          </Button>
        </Space>
      }
    >
      <div className="excel-chart-container">
        {/* Chart Type Selection - Excel Style */}
        <Card size="small" className="chart-type-card">
          <Title level={5} style={{ margin: 0, marginBottom: 12 }}>Chart Type</Title>
          <div className="excel-chart-types">
            {CHART_TYPES.map(type => (
              <div
                key={type.value}
                className={`excel-chart-type ${chartType === type.value ? 'active' : ''}`}
                onClick={() => setChartType(type.value)}
              >
                <div className="chart-type-icon">{type.icon}</div>
                <div className="chart-type-label">{type.label}</div>
              </div>
            ))}
          </div>
          
          {/* Column Chart Sub-types */}
          {chartType === 'column' && (
            <div style={{ marginTop: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>Column Chart Type</Title>
              <div className="column-subtypes">
                {COLUMN_SUBTYPES.map(subtype => (
                  <div
                    key={subtype.value}
                    className={`column-subtype ${columnSubType === subtype.value ? 'active' : ''}`}
                    onClick={() => setColumnSubType(subtype.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      margin: '4px 0',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: columnSubType === subtype.value ? '#e6f7ff' : '#fff',
                      borderColor: columnSubType === subtype.value ? '#1890ff' : '#d9d9d9'
                    }}
                  >
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>{subtype.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{subtype.label}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{subtype.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Line Chart Sub-types */}
          {chartType === 'line' && (
            <div style={{ marginTop: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>Line Chart Type</Title>
              <div className="line-subtypes">
                {LINE_SUBTYPES.map(subtype => (
                  <div
                    key={subtype.value}
                    className={`line-subtype ${lineSubType === subtype.value ? 'active' : ''}`}
                    onClick={() => setLineSubType(subtype.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      margin: '4px 0',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: lineSubType === subtype.value ? '#e6f7ff' : '#fff',
                      borderColor: lineSubType === subtype.value ? '#1890ff' : '#d9d9d9'
                    }}
                  >
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>{subtype.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{subtype.label}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{subtype.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Main Content Area */}
        <div className="excel-main-content">
          {/* Chart Display */}
          <Card className="chart-display-card">
            {chartTitle && (
              <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
                {chartTitle}
              </Title>
            )}
            {error && (
              <Alert
                message="Chart Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
                closable
                onClose={() => setError(null)}
              />
            )}
            <div className="chart-container">
              {loading ? <Spin size="large" /> : renderChart()}
            </div>
          </Card>

          {/* Excel-style Field Areas */}
          <Card size="small" className="field-areas-card">
            <Title level={5} style={{ margin: 0, marginBottom: 12 }}>Chart Fields</Title>
            
            <div className="excel-field-areas">
              {/* Filters */}
              <div 
                className={`field-area ${dragOverArea === 'filters' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'filters')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'filters')}
              >
                <div className="field-area-header">
                  <FilterOutlined /> Filters
                </div>
                <div className="field-area-content">
                  {selectedFields.filters.length === 0 ? (
                    <div className="field-area-placeholder">Drag fields here to filter</div>
                  ) : (
                    <div className="filter-fields-container">
                      {selectedFields.filters.map(field => (
                        <div key={field} className="filter-field-item">
                          <div className="filter-field-header">
                            <Tag
                              closable
                              onClose={() => removeFieldFromArea(field, 'filters')}
                              className="field-tag"
                            >
                              {columnAnalysis.all.find(col => col.key === field)?.header || field}
                            </Tag>
                          </div>
                          <div className="filter-field-options">
                            <Select
                              mode="multiple"
                              placeholder={`Select ${columnAnalysis.all.find(col => col.key === field)?.header || field} values`}
                              value={filterValues[field] || []}
                              onChange={(values) => handleFilterChange(field, values)}
                              style={{ width: '100%', minWidth: 200 }}
                              maxTagCount={3}
                              maxTagTextLength={10}
                              showSearch
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {(filterOptions[field] || []).map(value => (
                                <Option key={value} value={value}>
                                  {String(value)}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend (Series) */}
              <div 
                className={`field-area ${dragOverArea === 'legend' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'legend')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'legend')}
              >
                <div className="field-area-header">
                  <SortAscendingOutlined /> Legend (Series)
                </div>
                <div className="field-area-content">
                  {selectedFields.legend.length === 0 ? (
                    <div className="field-area-placeholder">Drag fields here for series</div>
                  ) : (
                    selectedFields.legend.map(field => (
                      <Tag
                        key={field}
                        closable
                        onClose={() => removeFieldFromArea(field, 'legend')}
                        className="field-tag"
                      >
                        {columnAnalysis.all.find(col => col.key === field)?.header || field}
                      </Tag>
                    ))
                  )}
                </div>
              </div>

              {/* Axis (Categories) */}
              <div 
                className={`field-area ${dragOverArea === 'axis' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'axis')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'axis')}
              >
                <div className="field-area-header">
                  <FontSizeOutlined /> Axis (Categories)
                </div>
                <div className="field-area-content">
                  {selectedFields.axis.length === 0 ? (
                    <div className="field-area-placeholder">Drag fields here for categories</div>
                  ) : (
                    selectedFields.axis.map(field => (
                      <Tag
                        key={field}
                        closable
                        onClose={() => removeFieldFromArea(field, 'axis')}
                        className="field-tag"
                      >
                        {columnAnalysis.all.find(col => col.key === field)?.header || field}
                      </Tag>
                    ))
                  )}
                </div>
              </div>

              {/* Values */}
              <div 
                className={`field-area ${dragOverArea === 'values' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'values')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'values')}
              >
                <div className="field-area-header">
                  <NumberOutlined /> Values
                </div>
                <div className="field-area-content">
                  {selectedFields.values.length === 0 ? (
                    <div className="field-area-placeholder">Drag fields here for values</div>
                  ) : (
                    <div className="values-field-list">
                      {selectedFields.values.map(field => (
                        <div key={field} className="value-field-item">
                          <div className="value-field-header">
                            <Tag
                              closable
                              onClose={() => removeFieldFromArea(field, 'values')}
                              className="field-tag"
                            >
                              {columnAnalysis.all.find(col => col.key === field)?.header || field}
                            </Tag>
                          </div>
                          <div className="value-field-aggregation">
                            <Select
                              size="small"
                              value={aggregationFunctions[field] || 'sum'}
                              onChange={(value) => handleAggregationChange(field, value)}
                              style={{ width: '100%', minWidth: 100 }}
                              placeholder="Aggregation"
                            >
                              {AGGREGATION_FUNCTIONS.map(func => (
                                <Option key={func.value} value={func.value}>
                                  <span style={{ marginRight: 4 }}>{func.icon}</span>
                                  {func.label}
                                </Option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Available Fields */}
          <Card size="small" className="available-fields-card">
            <Title level={5} style={{ margin: 0, marginBottom: 12 }}>Available Fields</Title>
            
            <Collapse size="small" ghost>
              <Panel header={`Numeric Fields (${columnAnalysis.numeric.length})`} key="numeric">
                <div className="field-list">
                  {columnAnalysis.numeric.map(col => (
                    <div
                      key={col.key}
                      className={`available-field ${draggedField === col.key ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.key)}
                      onDragEnd={handleDragEnd}
                      onClick={() => addFieldToArea(col.key, 'values')}
                      title={`Drag to chart areas or click to add to Values`}
                    >
                      <DragOutlined className="field-icon drag-handle" />
                      <NumberOutlined className="field-icon" />
                      <span className="field-name">{col.header}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              
              <Panel header={`Date Fields (${columnAnalysis.date.length})`} key="date">
                <div className="field-list">
                  {columnAnalysis.date.map(col => (
                    <div
                      key={col.key}
                      className={`available-field ${draggedField === col.key ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.key)}
                      onDragEnd={handleDragEnd}
                      onClick={() => addFieldToArea(col.key, 'axis')}
                      title={`Drag to chart areas or click to add to Axis`}
                    >
                      <DragOutlined className="field-icon drag-handle" />
                      <CalendarOutlined className="field-icon" />
                      <span className="field-name">{col.header}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              
              <Panel header={`Text Fields (${columnAnalysis.text.length})`} key="text">
                <div className="field-list">
                  {columnAnalysis.text.map(col => (
                    <div
                      key={col.key}
                      className={`available-field ${draggedField === col.key ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.key)}
                      onDragEnd={handleDragEnd}
                      onClick={() => addFieldToArea(col.key, 'axis')}
                      title={`Drag to chart areas or click to add to Axis`}
                    >
                      <DragOutlined className="field-icon drag-handle" />
                      <FontSizeOutlined className="field-icon" />
                      <span className="field-name">{col.header}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          </Card>
        </div>

        {/* Chart Options */}
        <Card size="small" className="chart-options-card">
          <Title level={5} style={{ margin: 0, marginBottom: 12 }}>Chart Options</Title>
          <Row gutter={16}>
            <Col span={24}>
              <Text strong>Chart Title</Text>
              <Input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
                style={{ marginTop: 4 }}
              />
            </Col>
          </Row>
        </Card>

        {/* Data Summary */}
        {processedData.length > 0 && (
          <Card size="small" className="data-summary-card">
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">Data points: {processedData.length}</Text>
              <Text type="secondary">Value fields: {selectedFields.values.length}</Text>
              <Text type="secondary">Chart type: {CHART_TYPES.find(t => t.value === chartType)?.label}</Text>
            </Space>
          </Card>
        )}
      </div>
    </Drawer>
  );
};

export default DataVisualizationPanel;