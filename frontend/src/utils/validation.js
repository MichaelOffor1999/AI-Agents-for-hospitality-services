/**
 * Production-ready validation utilities
 */

export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Please enter a valid phone number',
  },
  required: {
    test: (value) => value !== null && value !== undefined && value !== '',
    message: 'This field is required',
  },
  minLength: (min) => ({
    test: (value) => value && value.length >= min,
    message: `Minimum ${min} characters required`,
  }),
  maxLength: (max) => ({
    test: (value) => !value || value.length <= max,
    message: `Maximum ${max} characters allowed`,
  }),
  price: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Please enter a valid price (e.g., 10.99)',
  },
  positiveNumber: {
    test: (value) => !isNaN(value) && parseFloat(value) > 0,
    message: 'Please enter a positive number',
  },
};

export class Validator {
  static validate(value, rules) {
    const errors = [];

    for (const rule of rules) {
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message);
      } else if (rule.test && !rule.test(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateForm(formData, validationSchema) {
    const errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(validationSchema)) {
      const value = formData[field];
      const result = this.validate(value, rules);

      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors,
    };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  static validateBusinessHours(hours) {
    const errors = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
      const dayHours = hours[day];
      if (!dayHours) {
        errors[day] = 'Business hours are required';
        continue;
      }

      if (dayHours.isOpen) {
        if (!dayHours.open || !dayHours.close) {
          errors[day] = 'Open and close times are required';
        } else {
          const openTime = new Date(`2000-01-01 ${dayHours.open}`);
          const closeTime = new Date(`2000-01-01 ${dayHours.close}`);
          
          if (openTime >= closeTime) {
            errors[day] = 'Close time must be after open time';
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  static getErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  static categorizeError(error) {
    const message = error.message || error.toString();

    if (message.includes('Network Error') || message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection problem. Please check your internet connection.',
        retryable: true,
      };
    }

    if (message.includes('timeout') || message.includes('AbortError')) {
      return {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        retryable: true,
      };
    }

    if (message.includes('401') || message.includes('Unauthorized')) {
      return {
        type: 'auth',
        message: 'Session expired. Please log in again.',
        retryable: false,
      };
    }

    if (message.includes('403') || message.includes('Forbidden')) {
      return {
        type: 'permission',
        message: 'You do not have permission to perform this action.',
        retryable: false,
      };
    }

    if (message.includes('404') || message.includes('Not Found')) {
      return {
        type: 'notfound',
        message: 'The requested resource was not found.',
        retryable: false,
      };
    }

    if (message.includes('500') || message.includes('Internal Server Error')) {
      return {
        type: 'server',
        message: 'Server error. Please try again later.',
        retryable: true,
      };
    }

    return {
      type: 'unknown',
      message: this.getErrorMessage(error),
      retryable: true,
    };
  }

  static logError(error, context = {}) {
    const errorInfo = {
      message: this.getErrorMessage(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    console.error('Application Error:', errorInfo);

    // In production, send to error reporting service
    // Example: Sentry.captureException(error, { extra: context });
  }
}

/**
 * Retry mechanism for failed operations
 */
export class RetryHandler {
  static async retry(operation, maxAttempts = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorCategory = ErrorHandler.categorizeError(error);

        if (!errorCategory.retryable) {
          throw error;
        }

        if (attempt === maxAttempts) {
          break;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError;
  }
}
