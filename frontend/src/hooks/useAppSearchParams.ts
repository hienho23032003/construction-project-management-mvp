import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ParamValue = string | number | boolean | null | undefined;

export interface SetParamsOptions {
  replace?: boolean;
  clearKeys?: string[];
}

/**
 * Custom hook cung cấp các tiện ích đọc, ghi và đồng bộ URL query params (Search Params)
 * dùng chung cho toàn bộ các trang và component trong ứng dụng.
 */
export const useAppSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc giá trị dạng chuỗi
  const getParam = useCallback(
    (key: string, defaultValue = ''): string => {
      const val = searchParams.get(key);
      return val !== null ? val : defaultValue;
    },
    [searchParams]
  );

  // Đọc giá trị dạng số nguyên
  const getNumberParam = useCallback(
    (key: string, defaultValue = 0): number => {
      const val = searchParams.get(key);
      if (val === null) return defaultValue;
      const num = parseInt(val, 10);
      return isNaN(num) ? defaultValue : num;
    },
    [searchParams]
  );

  // Đọc giá trị dạng boolean
  const getBooleanParam = useCallback(
    (key: string, defaultValue = false): boolean => {
      const val = searchParams.get(key);
      if (val === null) return defaultValue;
      return val === 'true' || val === '1';
    },
    [searchParams]
  );

  // Cập nhật nhiều query params cùng lúc (tự động xóa key nếu giá trị rỗng/null/undefined)
  const setParams = useCallback(
    (updates: Record<string, ParamValue>, options?: SetParamsOptions) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (options?.clearKeys) {
            options.clearKeys.forEach((k) => next.delete(k));
          }

          Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === undefined || v === '') {
              next.delete(k);
            } else {
              next.set(k, String(v));
            }
          });

          return next;
        },
        { replace: options?.replace ?? true }
      );
    },
    [setSearchParams]
  );

  // Cập nhật 1 query param
  const setParam = useCallback(
    (key: string, value: ParamValue, options?: SetParamsOptions) => {
      setParams({ [key]: value }, options);
    },
    [setParams]
  );

  // Xóa các query params chỉ định
  const removeParams = useCallback(
    (...keys: string[]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          keys.forEach((k) => next.delete(k));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return {
    searchParams,
    setSearchParams,
    getParam,
    getNumberParam,
    getBooleanParam,
    setParam,
    setParams,
    removeParams,
  };
};
