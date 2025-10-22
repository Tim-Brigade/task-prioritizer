import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should initialize with value from localStorage if it exists', () => {
    localStorage.setItem('testKey', JSON.stringify('stored'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('updated'));
  });

  it('should handle objects', () => {
    const initialObj = { name: 'test', value: 123 };
    const { result } = renderHook(() => useLocalStorage('testKey', initialObj));

    expect(result.current[0]).toEqual(initialObj);

    const updatedObj = { name: 'updated', value: 456 };
    act(() => {
      result.current[1](updatedObj);
    });

    expect(result.current[0]).toEqual(updatedObj);
    expect(JSON.parse(localStorage.getItem('testKey'))).toEqual(updatedObj);
  });

  it('should handle arrays', () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('testKey', initialArray));

    expect(result.current[0]).toEqual(initialArray);

    const updatedArray = [4, 5, 6];
    act(() => {
      result.current[1](updatedArray);
    });

    expect(result.current[0]).toEqual(updatedArray);
    expect(JSON.parse(localStorage.getItem('testKey'))).toEqual(updatedArray);
  });

  it('should handle null and undefined', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1](undefined);
    });

    expect(result.current[0]).toBeUndefined();
  });

  it('should use initial value if localStorage has invalid JSON', () => {
    localStorage.setItem('testKey', 'invalid json{{{');

    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));

    expect(result.current[0]).toBe('fallback');
  });

  it('should persist across multiple hook instances with same key', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('sharedKey', 'initial'));

    act(() => {
      result1.current[1]('shared value');
    });

    const { result: result2 } = renderHook(() => useLocalStorage('sharedKey', 'initial'));

    expect(result2.current[0]).toBe('shared value');
  });

  it('should handle different keys independently', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

    act(() => {
      result1.current[1]('updated1');
    });

    expect(result1.current[0]).toBe('updated1');
    expect(result2.current[0]).toBe('value2');
  });
});
