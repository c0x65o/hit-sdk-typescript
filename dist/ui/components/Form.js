import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Form Component
 */
import { useState } from 'react';
import { useHitUI } from '../context';
// Eye icons for password toggle
const EyeIcon = () => (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] }));
const EyeOffIcon = () => (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }), _jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })] }));
export function Form({ id, endpoint, method = 'POST', fields, submitText = 'Submit', cancelText, onSuccess, initialValues = {}, layout = 'vertical', className, style, }) {
    const { apiBase, executeAction, closeModal } = useHitUI();
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState({});
    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when field changes
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };
    const validate = () => {
        const newErrors = {};
        for (const field of fields) {
            const value = formData[field.name];
            if (field.required && (value === undefined || value === null || value === '')) {
                newErrors[field.name] = `${field.label || field.name} is required`;
                continue;
            }
            if (field.validation) {
                for (const rule of field.validation) {
                    switch (rule.type) {
                        case 'required':
                            if (!value) {
                                newErrors[field.name] = rule.message || `${field.label || field.name} is required`;
                            }
                            break;
                        case 'email':
                            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
                                newErrors[field.name] = rule.message || 'Invalid email address';
                            }
                            break;
                        case 'min':
                            if (typeof value === 'number' && value < Number(rule.value)) {
                                newErrors[field.name] = rule.message || `Minimum value is ${rule.value}`;
                            }
                            if (typeof value === 'string' && value.length < Number(rule.value)) {
                                newErrors[field.name] = rule.message || `Minimum length is ${rule.value}`;
                            }
                            break;
                        case 'max':
                            if (typeof value === 'number' && value > Number(rule.value)) {
                                newErrors[field.name] = rule.message || `Maximum value is ${rule.value}`;
                            }
                            if (typeof value === 'string' && value.length > Number(rule.value)) {
                                newErrors[field.name] = rule.message || `Maximum length is ${rule.value}`;
                            }
                            break;
                        case 'pattern':
                            if (value && !new RegExp(String(rule.value)).test(String(value))) {
                                newErrors[field.name] = rule.message || 'Invalid format';
                            }
                            break;
                    }
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
        try {
            setLoading(true);
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || response.statusText);
            }
            // Parse response to check for auth tokens
            const data = await response.json().catch(() => ({}));
            // If response contains auth tokens, store them in localStorage
            // This handles login/register forms automatically
            if (data.token && typeof window !== 'undefined') {
                localStorage.setItem('hit_auth_token', data.token);
                if (data.refresh_token) {
                    localStorage.setItem('hit_auth_refresh_token', data.refresh_token);
                }
            }
            if (onSuccess) {
                await executeAction(onSuccess);
            }
        }
        catch (error) {
            console.error('Form submission failed:', error);
            setErrors({ _form: error instanceof Error ? error.message : 'Submission failed' });
        }
        finally {
            setLoading(false);
        }
    };
    const renderField = (field) => {
        const value = formData[field.name] ?? '';
        const error = errors[field.name];
        const commonProps = {
            id: `${id || 'form'}-${field.name}`,
            name: field.name,
            disabled: field.disabled || loading,
            readOnly: field.readOnly,
            placeholder: field.placeholder,
            className: `hit-field-input ${error ? 'hit-field-input-error' : ''}`,
        };
        let input;
        switch (field.type) {
            case 'TextField':
                const isPassword = field.inputType === 'password';
                const showPassword = passwordVisible[field.name] || false;
                if (isPassword) {
                    input = (_jsxs("div", { className: "hit-password-wrapper", children: [_jsx("input", { ...commonProps, type: showPassword ? 'text' : 'password', value: String(value), onChange: (e) => handleChange(field.name, e.target.value), className: `${commonProps.className} hit-password-input` }), _jsx("button", { type: "button", className: "hit-password-toggle", onClick: () => setPasswordVisible(prev => ({ ...prev, [field.name]: !prev[field.name] })), "aria-label": showPassword ? 'Hide password' : 'Show password', children: showPassword ? _jsx(EyeOffIcon, {}) : _jsx(EyeIcon, {}) })] }));
                }
                else {
                    input = (_jsx("input", { ...commonProps, type: field.inputType || 'text', value: String(value), onChange: (e) => handleChange(field.name, e.target.value) }));
                }
                break;
            case 'TextArea':
                input = (_jsx("textarea", { ...commonProps, rows: field.rows || 3, value: String(value), onChange: (e) => handleChange(field.name, e.target.value) }));
                break;
            case 'NumberField':
                input = (_jsx("input", { ...commonProps, type: "number", min: field.min, max: field.max, step: field.step, value: value === '' ? '' : Number(value), onChange: (e) => handleChange(field.name, e.target.valueAsNumber) }));
                break;
            case 'Select':
                input = (_jsxs("select", { ...commonProps, multiple: field.multiple, value: field.multiple ? (Array.isArray(value) ? value : []) : String(value), onChange: (e) => {
                        if (field.multiple) {
                            const values = Array.from(e.target.selectedOptions, (o) => o.value);
                            handleChange(field.name, values);
                        }
                        else {
                            handleChange(field.name, e.target.value);
                        }
                    }, children: [_jsx("option", { value: "", children: "Select..." }), field.options.map((opt) => (_jsx("option", { value: opt.value, disabled: opt.disabled, children: opt.label }, opt.value)))] }));
                break;
            case 'Checkbox':
                input = (_jsxs("label", { className: "hit-checkbox-label", children: [_jsx("input", { ...commonProps, type: "checkbox", checked: Boolean(value), onChange: (e) => handleChange(field.name, e.target.checked) }), field.checkboxLabel || field.label] }));
                break;
            case 'DateField':
                input = (_jsx("input", { ...commonProps, type: field.includeTime ? 'datetime-local' : 'date', value: String(value), onChange: (e) => handleChange(field.name, e.target.value) }));
                break;
            case 'Hidden':
                return (_jsx("input", { type: "hidden", name: field.name, value: String(field.value) }));
            default:
                input = _jsx("span", { children: "Unknown field type" });
        }
        return (_jsxs("div", { className: `hit-field hit-field-${layout} ${error ? 'hit-field-error' : ''}`, children: [field.type !== 'Checkbox' && field.label && (_jsxs("label", { htmlFor: commonProps.id, className: "hit-field-label", children: [field.label, field.required && _jsx("span", { className: "hit-field-required", children: "*" })] })), input, field.helpText && !error && (_jsx("span", { className: "hit-field-help", children: field.helpText })), error && _jsx("span", { className: "hit-field-error-text", children: error })] }, field.name));
    };
    return (_jsxs("form", { id: id, className: `hit-form hit-form-${layout} ${className || ''}`, style: style, onSubmit: handleSubmit, children: [errors._form && (_jsx("div", { className: "hit-form-error", children: errors._form })), _jsx("div", { className: "hit-form-fields", children: fields.map(renderField) }), _jsxs("div", { className: "hit-form-actions", children: [cancelText && (_jsx("button", { type: "button", className: "hit-btn hit-btn-secondary", onClick: () => closeModal(), disabled: loading, children: cancelText })), _jsx("button", { type: "submit", className: "hit-btn hit-btn-primary", disabled: loading, children: loading ? 'Submitting...' : submitText })] })] }));
}
