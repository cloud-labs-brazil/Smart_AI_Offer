# UX Specification

## Layout Structure

The dashboard follows a **3:1 grid layout**:
- **Left column (3/4)**: Main content area with tabbed views
- **Right column (1/4)**: Scenario Simulator + Risk Panel

## Navigation Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| Allocation | `AllocationHeatmap` | 21-day heatmap grid showing architect-day load |
| Forecast | `ForecastTimeline` | Area chart with capacity line and 30/60/90-day markers |
| Financial | `FinancialExposure` | Horizontal bar chart with HHI concentration index |
| Practice | `PracticeAnalytics` | Revenue distribution by practice area |
| Admin | `JiraApiSettings` | API configuration and sync settings |

## Page-Level Controls

Located in the Executive Overview header:

| Control | Icon | Function |
|---------|------|----------|
| Date Filter | `Filter` | Opens date-range picker dropdown |
| Re-upload CSV | `Upload` | Opens file picker to load new CSV |
| Export JSON | `Download` | Downloads full offer data as JSON |
| Reset | `RotateCcw` | Clears all data and returns to upload screen |

## Scenario Simulator Panel

### States
1. **Inactive**: Shows play button with description
2. **Active**: Shows comparison strip + 3 action panels + audit log

### Action Panels
- **Reallocate Offer**: Select offer → enter new owner → apply
- **Adjust Allocation %**: Select offer → select architect → slide % → apply
- **Add Capacity**: Enter name → select practice → add

### Comparison Strip (4 KPIs)
- Overload Days (with delta indicator)
- Revenue at Risk (with delta)
- Resource Pool (with add indicator)
- Actions Applied (with breakdown)

## Color System

Colors are driven by CSS variables from the active theme:
- `--color-primary`: Primary brand color
- `--color-danger`: Red for warnings/overload
- `--color-warning`: Yellow for caution states
- `--color-success`: Green for positive states
- `--color-muted`: Subdued text color

## Animation

All tab transitions use Framer Motion (`motion/react`):
- `fade-in` + `slide-in-from-bottom-2` for entering content
- `opacity: 0, x: -10` → `opacity: 1, x: 0` for tab switches
