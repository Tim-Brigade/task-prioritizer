import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useLocalStorageString, useLocalStorageBoolean } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { foo: 'bar' }));
    expect(result.current[0]).toEqual({ foo: 'bar' });
  });

  it('returns parsed value from localStorage', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ saved: 'value' }));
    const { result } = renderHook(() => useLocalStorage('test-key', { foo: 'bar' }));
    expect(result.current[0]).toEqual({ saved: 'value' });
  });

  it('saves value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));

    act(() => {
      result.current[1]([{ id: 1, name: 'test' }]);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify([{ id: 1, name: 'test' }])
    );
  });

  it('removes value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(result.current[0]).toBe('initial');
  });

  it('handles JSON parse errors gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid json{');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    consoleSpy.mockRestore();
  });
});

describe('useLocalStorageString', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorageString('font-key', 'Arial'));
    expect(result.current[0]).toBe('Arial');
  });

  it('returns stored string value', () => {
    localStorage.getItem.mockReturnValue('Helvetica');
    const { result } = renderHook(() => useLocalStorageString('font-key', 'Arial'));
    expect(result.current[0]).toBe('Helvetica');
  });

  it('saves string value directly without JSON encoding', () => {
    const { result } = renderHook(() => useLocalStorageString('font-key', 'Arial'));

    act(() => {
      result.current[1]('Times New Roman');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('font-key', 'Times New Roman');
  });
});

describe('useLocalStorageBoolean', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorageBoolean('hide-key', false));
    expect(result.current[0]).toBe(false);
  });

  it('parses "true" string as boolean true', () => {
    localStorage.getItem.mockReturnValue('true');
    const { result } = renderHook(() => useLocalStorageBoolean('hide-key', false));
    expect(result.current[0]).toBe(true);
  });

  it('parses "false" string as boolean false', () => {
    localStorage.getItem.mockReturnValue('false');
    const { result } = renderHook(() => useLocalStorageBoolean('hide-key', true));
    expect(result.current[0]).toBe(false);
  });

  it('saves boolean as string', () => {
    const { result } = renderHook(() => useLocalStorageBoolean('hide-key', false));

    act(() => {
      result.current[1](true);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('hide-key', 'true');
  });
});
