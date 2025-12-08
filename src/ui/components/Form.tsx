/**
 * Form Component
 */

import React, { useState, FormEvent } from 'react';
import type { FormSpec, FieldSpec } from '../types';
import { useHitUI } from '../context';

interface FormProps extends FormSpec {
  registry: Record<string, React.ComponentType<any>>;
}

export function Form({
  id,
  endpoint,
  method = 'POST',
  fields,
  submitText = 'Submit',
  cancelText,
  onSuccess,
  initialValues = {},
  layout = 'vertical',
  className,
  style,
}: FormProps) {
  const { apiBase, executeAction, closeModal } = useHitUI();
  const [formData, setFormData] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: unknown) => {
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

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
    } catch (error) {
      console.error('Form submission failed:', error);
      setErrors({ _form: error instanceof Error ? error.message : 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldSpec) => {
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

    let input: React.ReactNode;

    switch (field.type) {
      case 'TextField':
        input = (
          <input
            {...commonProps}
            type={field.inputType || 'text'}
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
        break;

      case 'TextArea':
        input = (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
        break;

      case 'NumberField':
        input = (
          <input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value === '' ? '' : Number(value)}
            onChange={(e) => handleChange(field.name, e.target.valueAsNumber)}
          />
        );
        break;

      case 'Select':
        input = (
          <select
            {...commonProps}
            multiple={field.multiple}
            value={field.multiple ? (Array.isArray(value) ? value : []) : String(value)}
            onChange={(e) => {
              if (field.multiple) {
                const values = Array.from(e.target.selectedOptions, (o) => o.value);
                handleChange(field.name, values);
              } else {
                handleChange(field.name, e.target.value);
              }
            }}
          >
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'Checkbox':
        input = (
          <label className="hit-checkbox-label">
            <input
              {...commonProps}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            />
            {field.checkboxLabel || field.label}
          </label>
        );
        break;

      case 'DateField':
        input = (
          <input
            {...commonProps}
            type={field.includeTime ? 'datetime-local' : 'date'}
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
        break;

      case 'Hidden':
        return (
          <input type="hidden" name={field.name} value={String(field.value)} />
        );

      default:
        input = <span>Unknown field type</span>;
    }

    return (
      <div
        key={field.name}
        className={`hit-field hit-field-${layout} ${error ? 'hit-field-error' : ''}`}
      >
        {field.type !== 'Checkbox' && field.label && (
          <label htmlFor={commonProps.id} className="hit-field-label">
            {field.label}
            {field.required && <span className="hit-field-required">*</span>}
          </label>
        )}
        {input}
        {field.helpText && !error && (
          <span className="hit-field-help">{field.helpText}</span>
        )}
        {error && <span className="hit-field-error-text">{error}</span>}
      </div>
    );
  };

  return (
    <form
      id={id}
      className={`hit-form hit-form-${layout} ${className || ''}`}
      style={style}
      onSubmit={handleSubmit}
    >
      {errors._form && (
        <div className="hit-form-error">{errors._form}</div>
      )}

      <div className="hit-form-fields">
        {fields.map(renderField)}
      </div>

      <div className="hit-form-actions">
        {cancelText && (
          <button
            type="button"
            className="hit-btn hit-btn-secondary"
            onClick={() => closeModal()}
            disabled={loading}
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          className="hit-btn hit-btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : submitText}
        </button>
      </div>
    </form>
  );
}

