import { useState, useCallback } from "react";
import { z } from "zod";

interface ValidationRule<T> {
  schema: z.ZodSchema<T>;
  onValidationChange?: (isValid: boolean) => void;
}

export function useFormValidation<T>({ schema, onValidationChange }: ValidationRule<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((data: Partial<T>) => {
    try {
      schema.parse(data);
      setErrors({});
      setIsValid(true);
      onValidationChange?.(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(newErrors);
        setIsValid(false);
        onValidationChange?.(false);
      }
      return false;
    }
  }, [schema, onValidationChange]);

  const validateField = useCallback((fieldName: string, value: any) => {
    try {
      // For field validation, we'll just check if the value is valid for the field
      const testData = { [fieldName]: value };
      schema.safeParse(testData);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: error.errors[0]?.message || 'Invalid value'
        }));
      }
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors
  };
}