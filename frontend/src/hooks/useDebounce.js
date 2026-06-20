// src/hooks/useDebounce.js
// Delays updating a value until the user stops typing for `delay` ms.
// Used for search inputs to avoid firing an API request on every keystroke.
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

export default useDebounce;
