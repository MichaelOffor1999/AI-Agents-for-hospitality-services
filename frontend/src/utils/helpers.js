export const formatCurrency = (amount, currency = '€') => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return `${currency}${amount.toFixed(2)}`;
};

export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'datetime':
      return dateObj.toLocaleString('en-IE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString('en-IE');
  }
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it's an Irish number
  if (cleaned.startsWith('+353')) {
    return cleaned.replace(/(\+353)(\d{1,2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  
  // For other numbers, just return as is
  return cleaned;
};

export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return ((current - previous) / previous) * 100;
};

export const formatGrowth = (growth) => {
  if (growth === 0) return '0%';
  
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const getStatusIcon = (status) => {
  const icons = {
    pending: 'time-outline',
    confirmed: 'checkmark-circle-outline',
    preparing: 'restaurant-outline',
    ready: 'alarm-outline',
    completed: 'checkmark-done-outline',
    cancelled: 'close-circle-outline',
  };
  return icons[status] || 'help-circle-outline';
};

export const getOrderTypeIcon = (type) => {
  const icons = {
    takeaway: 'bag-outline',
    delivery: 'bicycle-outline',
    'dine-in': 'restaurant-outline',
  };
  return icons[type] || 'bag-outline';
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');

  // In a real app, you would use a file system library to save
  return csvContent;
};

export const generateReceiptHTML = (order) => {
  const { calculateTotals } = order;
  const totals = calculateTotals();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .order-info { margin: 15px 0; }
            .items { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .totals { border-top: 1px solid #000; padding-top: 10px; }
            .total { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Kitchen Receipt</h2>
            <p>Order #${order.id}</p>
            <p>${formatDate(order.createdAt, 'datetime')}</p>
        </div>
        
        <div class="order-info">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhone}</p>
            <p><strong>Type:</strong> ${order.type}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </div>
        
        <div class="items">
            <h3>Items:</h3>
            ${order.items.map(item => `
                <div class="item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${formatCurrency(item.getTotal())}</span>
                </div>
                ${item.notes ? `<div style="margin-left: 20px; font-style: italic;">Notes: ${item.notes}</div>` : ''}
            `).join('')}
        </div>
        
        <div class="totals">
            <div class="item">
                <span>Subtotal:</span>
                <span>${formatCurrency(totals.subtotal)}</span>
            </div>
            <div class="item">
                <span>Tax:</span>
                <span>${formatCurrency(totals.tax)}</span>
            </div>
            <div class="item total">
                <span>Total:</span>
                <span>${formatCurrency(totals.total)}</span>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const colors = {
  primary: '#4F83FF',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  darkGray: '#374151',
  white: '#FFFFFF',
  black: '#000000',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
