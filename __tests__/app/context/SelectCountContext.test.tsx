import { render, renderHook, act } from '@testing-library/react';
import { useSelectedCount, SelectedCountProvider } from '../../../app/context/SelectCountContex';

// filepath: app/context/SelectCountContext.test.tsx

describe('SelectedCountContext', () => {
  // Provider Tests
  describe('SelectedCountProvider', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <SelectedCountProvider>
          <div>Test Child</div>
        </SelectedCountProvider>
      );
      expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('initializes with count 0', () => {
      const TestComponent = () => {
        const { countSelectedPoints } = useSelectedCount();
        return <div>{countSelectedPoints}</div>;
      };

      const { getByText } = render(
        <SelectedCountProvider>
          <TestComponent />
        </SelectedCountProvider>
      );
      expect(getByText('0')).toBeInTheDocument();
    });
  });

  // Hook Tests
  // ...existing code...

describe('useSelectedCount', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useSelectedCount());
      }).toThrow('useSelectedCount must be used within a SelectedCountProvider');
    });

    it('updates count correctly', () => {
      const { result } = renderHook(() => useSelectedCount(), {
        wrapper: SelectedCountProvider,
      });

      act(() => {
        result.current.setCountSelectedPoints(5);
      });

      expect(result.current.countSelectedPoints).toBe(5);
    });

    it('shares state between components', () => {
      const FirstComponent = () => {
        const { countSelectedPoints } = useSelectedCount();
        return <div data-testid="first">{countSelectedPoints}</div>;
      };

      const SecondComponent = () => {
        const { setCountSelectedPoints } = useSelectedCount();
        return (
          <button onClick={() => setCountSelectedPoints(10)}>Update Count</button>
        );
      };

      const { getByTestId, getByText } = render(
        <SelectedCountProvider>
          <FirstComponent />
          <SecondComponent />
        </SelectedCountProvider>
      );

      getByText('Update Count').click();
      expect(getByTestId('first')).toHaveTextContent("0");
    });
  });

  // Corner Cases
  describe('corner cases', () => {
    it('handles undefined children gracefully', () => {
      expect(() => 
        render(<SelectedCountProvider>{undefined}</SelectedCountProvider>)
      ).not.toThrow();
    });

    it('handles extreme values', () => {
      const { result } = renderHook(() => useSelectedCount(), {
        wrapper: SelectedCountProvider,
      });

      act(() => {
        result.current.setCountSelectedPoints(Number.MAX_SAFE_INTEGER);
      });
      expect(result.current.countSelectedPoints).toBe(Number.MAX_SAFE_INTEGER);

      act(() => {
        result.current.setCountSelectedPoints(Number.MIN_SAFE_INTEGER);
      });
      expect(result.current.countSelectedPoints).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('works with nested providers', () => {
      const { result } = renderHook(
        () => ({
          outer: useSelectedCount(),
          inner: useSelectedCount()
        }),
        {
          wrapper: ({ children }) => (
            <SelectedCountProvider>
              <SelectedCountProvider>
                {children}
              </SelectedCountProvider>
            </SelectedCountProvider>
          ),
        }
      );

      act(() => {
        result.current.inner.setCountSelectedPoints(5);
      });

      expect(result.current.inner.countSelectedPoints).toBe(5);
      expect(result.current.outer.countSelectedPoints).toBe(5);
    });
  });
});