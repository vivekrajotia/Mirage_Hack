# Data Visualization Guide

## Overview

The Data Visualization Panel provides Excel-like charting capabilities for your trading dashboard. It allows you to create interactive charts using drag-and-drop functionality with complete flexibility over your data model.

## Accessing the Visualization Panel

1. Navigate to the Dashboard
2. Click the **"Visual Representation"** button (blue gradient button with chart icon) in the Trade History section
3. The visualization panel will open as a modal dialog

## Features

### Chart Types Available

1. **Column Charts**
   - Clustered Column: Compare values side by side
   - Stacked Column: Show parts stacked vertically
   - 100% Stacked Column: Show percentage contributions
   - Stacked Bar: Horizontal stacked bars

2. **Line Charts**
   - Basic Line: Simple line with data points
   - Smooth Line: Curved line for smoother visualization
   - Stepped Line: Step-like changes
   - Dashed Line: Dashed line style
   - Line with Markers: Emphasized data points

3. **Pie Charts**
   - Show parts of a whole
   - Supports one value field only

4. **Area Charts**
   - Show cumulative totals with filled areas
   - Multiple series stacked

5. **Scatter Charts**
   - Show correlation between two variables
   - Requires exactly two value fields

### Field Areas

The visualization uses four main field areas:

#### 1. Filters
- **Purpose**: Filter your data before visualization
- **Usage**: Drag categorical fields here to create filters
- **Example**: Filter by commodity, trader, or counterparty

#### 2. Axis (Categories)
- **Purpose**: Define the X-axis categories
- **Usage**: Drag one field here (date, text, or categorical data)
- **Example**: Use `eod_run_date` for time-series charts or `commodity` for category comparisons

#### 3. Values
- **Purpose**: Define the numeric values to visualize
- **Usage**: Drag numeric fields here
- **Aggregation Options**: Sum, Count, Average, Min, Max, Product
- **Example**: `mtm_pnl`, `trade_value`, `buy_open_position`

#### 4. Legend (Series)
- **Purpose**: Group data by categories for multi-series charts
- **Usage**: Drag one field here to create multiple series
- **Example**: Group by `trader_name` to see each trader's performance

### Data Types

The system automatically detects three types of fields:

1. **Numeric Fields** (Blue hash icon)
   - Fields like `mtm_pnl`, `trade_value`, positions
   - Can be used in Values area
   - Support aggregation functions

2. **Date Fields** (Green calendar icon)
   - Fields like `eod_run_date`, `created_timestamp`
   - Best used in Axis area for time-series analysis
   - Automatically formatted for display

3. **Text Fields** (Purple text icon)
   - Fields like `commodity`, `trader_name`, `counterparty`
   - Used in Axis, Legend, or Filters areas
   - Create categorical groupings

## Example Use Cases

### 1. PnL by Commodity Over Time
- **Chart Type**: Line Chart
- **Axis**: `eod_run_date`
- **Values**: `mtm_pnl` (Sum)
- **Legend**: `commodity`
- **Result**: Multi-line chart showing PnL trends for each commodity

### 2. Trade Volume by Trader
- **Chart Type**: Column Chart (Clustered)
- **Axis**: `trader_name`
- **Values**: `trade_value` (Sum)
- **Result**: Bar chart comparing total trade values by trader

### 3. Portfolio Breakdown
- **Chart Type**: Pie Chart
- **Axis**: `commodity`
- **Values**: `trade_value` (Sum)
- **Result**: Pie chart showing portfolio allocation by commodity

### 4. Position Analysis
- **Chart Type**: Scatter Chart
- **Values**: `buy_open_position` and `sell_open_position`
- **Result**: Scatter plot showing relationship between buy and sell positions

### 5. Monthly Performance Trends
- **Chart Type**: Area Chart
- **Axis**: `eod_run_date`
- **Values**: `mtm_pnl`, `realized_pnl_today` (Sum)
- **Result**: Stacked area chart showing cumulative PnL trends

## Best Practices

### 1. Data Preparation
- Ensure your filters are set appropriately before creating charts
- Use date ranges in the main dashboard to limit data scope
- Consider the volume of data (charts are limited to 100 data points for performance)

### 2. Chart Selection
- **Time Series**: Use Line or Area charts with date fields on the axis
- **Comparisons**: Use Column charts for comparing categories
- **Proportions**: Use Pie charts for showing parts of a whole
- **Correlations**: Use Scatter charts for two numeric variables

### 3. Field Organization
- **Axis**: Use fields that create meaningful categories or time sequences
- **Values**: Always use numeric fields with appropriate aggregation
- **Legend**: Use categorical fields to group your data meaningfully
- **Filters**: Use to focus on specific subsets of your data

### 4. Performance Tips
- Use filters to reduce data volume for better performance
- Limit the number of series in multi-series charts
- Consider aggregating data at appropriate time intervals

## Drag and Drop Workflow

1. **Select Chart Type**: Choose from the chart type options on the left
2. **Drag Fields**: 
   - From the "Available Fields" section
   - To the appropriate field areas (Filters, Axis, Values, Legend)
3. **Configure Aggregations**: 
   - Select aggregation functions for numeric fields in the Values area
4. **Set Filters**: 
   - Use dropdown menus to select specific values for filter fields
5. **Customize**: 
   - Add chart title
   - Adjust chart subtype if available
6. **View**: 
   - Chart updates automatically as you make changes

## Troubleshooting

### Common Issues

1. **No Chart Appears**
   - Ensure you have at least one field in the Values area
   - Check that your Value fields are numeric
   - Verify you have an Axis field for most chart types

2. **Empty Chart**
   - Check your filters - they might be too restrictive
   - Ensure your data contains valid values for the selected fields
   - Verify date formats are recognized

3. **Performance Issues**
   - Reduce the number of data points using filters
   - Limit the date range in the main dashboard
   - Use fewer series in multi-series charts

4. **Chart Not Updating**
   - Try resetting the chart and starting over
   - Ensure all required fields are properly selected
   - Check that aggregation functions are set for Value fields

### Error Messages

- **"Values area only accepts numeric fields"**: Move non-numeric fields to Axis, Legend, or Filters
- **"Axis area accepts only one field"**: Remove extra fields from the Axis area
- **"Legend area accepts only one field"**: Remove extra fields from the Legend area
- **"Pie charts require exactly one value field"**: Use only one numeric field for pie charts
- **"Scatter charts require exactly two value fields"**: Add exactly two numeric fields for scatter plots

## Advanced Features

### Aggregation Functions

- **Sum**: Total of all values (default for most financial metrics)
- **Count**: Number of records (useful for trade counts)
- **Average**: Mean value (useful for average trade sizes)
- **Min/Max**: Extreme values (useful for risk analysis)
- **Product**: Multiplication of values (specialized calculations)

### Chart Subtypes

**Column Charts**:
- Clustered: Side-by-side comparison
- Stacked: Cumulative view
- 100% Stacked: Percentage view
- Bar Stack: Horizontal layout

**Line Charts**:
- Basic: Standard line chart
- Smooth: Curved lines
- Stepped: Step-like progression
- Dashed: Dashed line style
- Markers: Emphasized data points

## Data Integration

The visualization component automatically works with your complete trading data model, including:

- **Trading Information**: `trade_id`, `commodity`, `counterparty`
- **Financial Metrics**: `mtm_pnl`, `trade_value`, `closed_pnl_today`
- **Positions**: `buy_open_position`, `sell_open_position`
- **Dates**: `eod_run_date`, `created_timestamp`
- **Categories**: `trader_name`, `profitcenter`, `company`
- **Costs**: `finance_cost`, `freight_cost`, `insurance_cost`

All fields from your JSON data are automatically detected and categorized for easy use in the visualization interface. 