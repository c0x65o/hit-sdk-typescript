/**
 * Hit UI Spec Types
 *
 * Server-Driven UI specification for Hit components.
 * Components return these specs, and the SDK renders them.
 */

// ============================================================================
// Base Types
// ============================================================================

/** Base props that all UI specs can have */
export interface BaseSpec {
  /** Unique key for React rendering */
  key?: string;
  /** CSS class names to apply */
  className?: string;
  /** Inline styles */
  style?: Record<string, string | number>;
  /** Whether the component is visible */
  visible?: boolean;
  /** Conditional visibility expression */
  visibleIf?: string;
}

// ============================================================================
// Actions
// ============================================================================

export type ActionSpec =
  | NavigateAction
  | ApiCallAction
  | SubmitAction
  | OpenModalAction
  | CloseModalAction
  | RefreshAction
  | CustomAction;

export interface NavigateAction {
  type: 'navigate';
  /** URL or path to navigate to. Supports {field} interpolation */
  to: string;
  /** Whether to open in new tab */
  newTab?: boolean;
}

export interface ApiCallAction {
  type: 'api';
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** API endpoint. Supports {field} interpolation */
  endpoint: string;
  /** Request body (for POST/PUT/PATCH) */
  body?: Record<string, unknown>;
  /** Action to perform after success */
  onSuccess?: ActionSpec;
  /** Action to perform after error */
  onError?: ActionSpec;
  /** Confirmation message before executing */
  confirm?: string;
}

export interface SubmitAction {
  type: 'submit';
  /** Form ID to submit */
  formId?: string;
}

export interface OpenModalAction {
  type: 'openModal';
  /** Modal ID or UI spec to render */
  modal: string | UISpec;
}

export interface CloseModalAction {
  type: 'closeModal';
  /** Modal ID to close (or current if not specified) */
  modalId?: string;
}

export interface RefreshAction {
  type: 'refresh';
  /** Specific component IDs to refresh, or all if not specified */
  targets?: string[];
}

export interface CustomAction {
  type: 'custom';
  /** Custom action name for host app to handle */
  name: string;
  /** Custom action payload */
  payload?: Record<string, unknown>;
}

// ============================================================================
// Layout Components
// ============================================================================

export interface PageSpec extends BaseSpec {
  type: 'Page';
  /** Page title */
  title?: string;
  /** Page description/subtitle */
  description?: string;
  /** Child components */
  children?: UISpec[];
  /** Actions available in page header */
  actions?: ButtonSpec[];
}

export interface CardSpec extends BaseSpec {
  type: 'Card';
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Child components */
  children?: UISpec[];
  /** Footer content */
  footer?: UISpec[];
}

export interface RowSpec extends BaseSpec {
  type: 'Row';
  /** Gap between items (in pixels or CSS value) */
  gap?: number | string;
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justification */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Child components */
  children?: UISpec[];
}

export interface ColumnSpec extends BaseSpec {
  type: 'Column';
  /** Gap between items */
  gap?: number | string;
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Child components */
  children?: UISpec[];
}

export interface GridSpec extends BaseSpec {
  type: 'Grid';
  /** Number of columns */
  columns?: number;
  /** Gap between items */
  gap?: number | string;
  /** Child components */
  children?: UISpec[];
}

export interface TabsSpec extends BaseSpec {
  type: 'Tabs';
  /** Default active tab */
  defaultTab?: string;
  /** Tab definitions */
  tabs: TabItemSpec[];
}

export interface TabItemSpec {
  /** Tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Tab icon (icon name or URL) */
  icon?: string;
  /** Tab content */
  children?: UISpec[];
}

// ============================================================================
// Data Display Components
// ============================================================================

export interface DataTableSpec extends BaseSpec {
  type: 'DataTable';
  /** API endpoint to fetch data from */
  endpoint: string;
  /** Column definitions */
  columns: ColumnDef[];
  /** Enable row selection */
  selectable?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Rows per page */
  pageSize?: number;
  /** Enable search */
  searchable?: boolean;
  /** Row actions */
  rowActions?: ButtonSpec[];
  /** Empty state message */
  emptyMessage?: string;
  /** Enable sorting */
  sortable?: boolean;
}

export interface ColumnDef {
  /** Field key in the data */
  key: string;
  /** Column header label */
  label: string;
  /** Data type for formatting */
  type?: 'text' | 'number' | 'boolean' | 'datetime' | 'date' | 'currency' | 'badge' | 'link';
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string | number;
  /** Custom render spec */
  render?: UISpec;
  /** Badge color mapping for badge type */
  badgeColors?: Record<string, string>;
}

export interface StatsGridSpec extends BaseSpec {
  type: 'StatsGrid';
  /** Stat items */
  items: StatItemSpec[];
  /** Number of columns */
  columns?: number;
}

export interface StatItemSpec {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Change from previous period */
  change?: number;
  /** Change type */
  changeType?: 'increase' | 'decrease' | 'neutral';
  /** Icon name */
  icon?: string;
  /** Click action */
  onClick?: ActionSpec;
}

export interface TextSpec extends BaseSpec {
  type: 'Text';
  /** Text content */
  content: string;
  /** Text variant */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'muted';
}

export interface BadgeSpec extends BaseSpec {
  type: 'Badge';
  /** Badge text */
  text: string;
  /** Badge color */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface IconSpec extends BaseSpec {
  type: 'Icon';
  /** Icon name (from icon set) or URL */
  name: string;
  /** Icon size */
  size?: 'sm' | 'md' | 'lg' | number;
}

// ============================================================================
// Form Components
// ============================================================================

export interface FormSpec extends BaseSpec {
  type: 'Form';
  /** Form ID for referencing */
  id?: string;
  /** API endpoint to submit to */
  endpoint: string;
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Form fields */
  fields: FieldSpec[];
  /** Submit button text */
  submitText?: string;
  /** Cancel button text (if shown) */
  cancelText?: string;
  /** Action after successful submit */
  onSuccess?: ActionSpec;
  /** Initial values */
  initialValues?: Record<string, unknown>;
  /** Layout direction */
  layout?: 'vertical' | 'horizontal';
}

export type FieldSpec =
  | TextFieldSpec
  | TextAreaFieldSpec
  | NumberFieldSpec
  | SelectFieldSpec
  | CheckboxFieldSpec
  | DateFieldSpec
  | HiddenFieldSpec;

export interface BaseFieldSpec extends BaseSpec {
  /** Field name (maps to form data) */
  name: string;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Validation rules */
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number;
  message?: string;
}

export interface TextFieldSpec extends BaseFieldSpec {
  type: 'TextField';
  /** Input type */
  inputType?: 'text' | 'email' | 'password' | 'url' | 'tel';
}

export interface TextAreaFieldSpec extends BaseFieldSpec {
  type: 'TextArea';
  /** Number of rows */
  rows?: number;
}

export interface NumberFieldSpec extends BaseFieldSpec {
  type: 'NumberField';
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step value */
  step?: number;
}

export interface SelectFieldSpec extends BaseFieldSpec {
  type: 'Select';
  /** Options */
  options: SelectOption[];
  /** Allow multiple selection */
  multiple?: boolean;
  /** Allow search/filter */
  searchable?: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface CheckboxFieldSpec extends BaseFieldSpec {
  type: 'Checkbox';
  /** Checkbox label (different from field label) */
  checkboxLabel?: string;
}

export interface DateFieldSpec extends BaseFieldSpec {
  type: 'DateField';
  /** Include time picker */
  includeTime?: boolean;
  /** Date format */
  format?: string;
}

export interface HiddenFieldSpec extends BaseFieldSpec {
  type: 'Hidden';
  /** Field value */
  value: string | number;
}

// ============================================================================
// Action Components
// ============================================================================

export interface ButtonSpec extends BaseSpec {
  type: 'Button';
  /** Button text */
  label: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Icon (before label) */
  icon?: string;
  /** Icon after label */
  iconRight?: string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  loading?: boolean;
  /** Click action */
  onClick?: ActionSpec;
}

export interface LinkSpec extends BaseSpec {
  type: 'Link';
  /** Link text */
  label: string;
  /** URL or path */
  href: string;
  /** Open in new tab */
  newTab?: boolean;
}

// ============================================================================
// Modal & Overlay Components
// ============================================================================

export interface ModalSpec extends BaseSpec {
  type: 'Modal';
  /** Modal ID for referencing */
  id?: string;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Child components */
  children?: UISpec[];
  /** Footer actions */
  footer?: UISpec[];
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
}

export interface AlertSpec extends BaseSpec {
  type: 'Alert';
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Whether alert is dismissible */
  dismissible?: boolean;
}

// ============================================================================
// Async/Loading Components
// ============================================================================

export interface AsyncSpec extends BaseSpec {
  type: 'Async';
  /** API endpoint to fetch UI spec from */
  endpoint: string;
  /** Loading placeholder */
  loading?: UISpec;
  /** Error placeholder */
  error?: UISpec;
}

export interface LoadingSpec extends BaseSpec {
  type: 'Loading';
  /** Loading text */
  text?: string;
  /** Loading variant */
  variant?: 'spinner' | 'skeleton' | 'dots';
}

// ============================================================================
// Custom Widget Component
// ============================================================================

export interface CustomWidgetSpec extends BaseSpec {
  type: 'CustomWidget';
  /** Widget name registered by the host app */
  widget: string;
  /** Props passed to the widget */
  props?: Record<string, unknown>;
  /** Fallback UI if widget not registered */
  fallback?: UISpec;
}

// ============================================================================
// Union Type
// ============================================================================

export type UISpec =
  // Layout
  | PageSpec
  | CardSpec
  | RowSpec
  | ColumnSpec
  | GridSpec
  | TabsSpec
  // Data Display
  | DataTableSpec
  | StatsGridSpec
  | TextSpec
  | BadgeSpec
  | IconSpec
  // Forms
  | FormSpec
  // Actions
  | ButtonSpec
  | LinkSpec
  // Modal & Overlay
  | ModalSpec
  | AlertSpec
  // Async
  | AsyncSpec
  | LoadingSpec
  // Custom
  | CustomWidgetSpec;

// ============================================================================
// Renderer Types
// ============================================================================

/** Custom component registry for host app overrides */
export type ComponentRegistry = Partial<
  Record<UISpec['type'], React.ComponentType<any>>
>;

/** Context passed to all components */
export interface HitUIContext {
  /** API base URL for the component */
  apiBase: string;
  /** Execute an action */
  executeAction: (action: ActionSpec, context?: Record<string, unknown>) => Promise<void>;
  /** Current row data (when inside a DataTable row) */
  rowData?: Record<string, unknown>;
  /** Current form data (when inside a Form) */
  formData?: Record<string, unknown>;
  /** Refresh a component by ID */
  refresh: (targetId?: string) => void;
  /** Open a modal */
  openModal: (spec: UISpec) => void;
  /** Close current modal */
  closeModal: () => void;
  /** Navigate to a path */
  navigate: (path: string, newTab?: boolean) => void;
}

/** Props for the main renderer */
export interface HitUIRendererProps {
  /** UI specification to render */
  spec: UISpec;
  /** API base URL for the component */
  apiBase: string;
  /** Custom component overrides */
  components?: ComponentRegistry;
  /** Custom widgets registered by the host app */
  customWidgets?: CustomWidgetRegistry;
  /** Custom navigate function */
  onNavigate?: (path: string, newTab?: boolean) => void;
  /** Custom action handler for 'custom' action type */
  onCustomAction?: (name: string, payload?: Record<string, unknown>) => void;
  /** Error boundary fallback */
  errorFallback?: React.ReactNode;
  /** Loading fallback */
  loadingFallback?: React.ReactNode;
}

/** Custom widget registry for host app widgets */
export type CustomWidgetRegistry = Record<string, React.ComponentType<any>>;

/** Feature pack context for apps using feature packs */
export interface FeaturePackContext {
  /** UI render module base URL */
  uiRenderUrl: string;
  /** Enabled feature packs */
  enabledPacks: string[];
  /** Navigate to a feature pack page */
  navigateToPackPage: (pack: string, page: string) => void;
}

/** Props for feature pack page component */
export interface FeaturePackPageProps {
  /** Feature pack name */
  pack: string;
  /** Page name within the pack */
  page: string;
  /** Additional query parameters */
  params?: Record<string, string>;
}

