/**
 * Form Component
 */
import React from 'react';
import type { FormSpec } from '../types';
interface FormProps extends FormSpec {
    registry: Record<string, React.ComponentType<any>>;
}
export declare function Form({ id, endpoint, method, fields, submitText, cancelText, onSuccess, initialValues, layout, className, style, }: FormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Form.d.ts.map