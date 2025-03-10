import { render, screen, fireEvent } from '@testing-library/react';
import {
    DashboardButton,
    FilterButton,
    LocationButton,
    MapButton,
    RainButton,
    SeverityButton,
    TemperatureButton,
    WarningButton,
    HumidityButton,
  } from '../../app/components/floating_buttons';
import IndonesiaMap from '../../app/components/IndonesiaMap';

const testButtonClick = (ButtonComponent: any, buttonLabel: string) => {
  const handleClick = jest.fn();
  render(<ButtonComponent onClick={handleClick} />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
};

describe('Button Components', () => {
  test('SeverityButton renders and responds to click', () => {
    testButtonClick(SeverityButton, 'Settings');
  });

  test('TemperatureButton renders and responds to click', () => {
    testButtonClick(TemperatureButton, 'Temperature');
  });

  test('WarningButton renders and shows warning on hover', () => {
    render(<WarningButton label="Warning" />);
    const button = screen.getByRole('button', { name: 'Warning' });
    fireEvent.mouseEnter(button);
    expect(screen.getByText(/Waspada!/)).toBeInTheDocument();
  });

  test('DashboardButton renders and responds to click', () => {
    testButtonClick(DashboardButton, 'Chart Button');
  });

  test('FilterButton renders and responds to click', () => {
    testButtonClick(FilterButton, 'Open filters');
  });

  test('HumidityButton renders and responds to click', () => {
    testButtonClick(HumidityButton, 'Toggle humidity map view');
  });

  test('LocationButton renders and responds to click', () => {
    testButtonClick(LocationButton, 'Location');
  });

  test('MapButton renders and shows additional buttons when clicked', () => {
    render(<MapButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
  });

  test('RainButton renders and responds to click', () => {
    testButtonClick(RainButton, 'Rain');
  });
});

describe('IndonesiaMap Component', () => {
  test('renders all floating buttons', () => {
    render(<IndonesiaMap onError={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Chart Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Warning' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Map' })).toBeInTheDocument(); // MapButton
  });
});

describe('LocationButton', () => {
    test('renders with different variants and sizes', () => {
      const { rerender } = render(<LocationButton data-testid="location-btn" />);
      
      // Default variant and size
      let button = screen.getByTestId('location-btn');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('w-10 h-10');
      
      // Outline variant
      rerender(<LocationButton data-testid="location-btn" variant="outline" />);
      button = screen.getByTestId('location-btn');
      expect(button).toHaveClass('border border-gray-300');
      
      // Small size
      rerender(<LocationButton data-testid="location-btn" size="sm" />);
      button = screen.getByTestId('location-btn');
      expect(button).toHaveClass('w-8 h-8');
      
      // Large size
      rerender(<LocationButton data-testid="location-btn" size="lg" />);
      button = screen.getByTestId('location-btn');
      expect(button).toHaveClass('w-16 h-16');
    });
    
    test('renders with disabled state', () => {
      render(<LocationButton disabled data-testid="location-btn" />);
      const button = screen.getByTestId('location-btn');
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).toBeDisabled();
    });
    
    test('applies custom className', () => {
      render(<LocationButton className="custom-class" data-testid="location-btn" />);
      const button = screen.getByTestId('location-btn');
      expect(button).toHaveClass('custom-class');
    });
    
    test('forwards additional props', () => {
      render(<LocationButton data-testid="location-btn" title="Custom Title" />);
      const button = screen.getByTestId('location-btn');
      expect(button).toHaveAttribute('title', 'Custom Title');
    });
  });
  
  describe('WarningButton', () => {
    test('uses default aria-label when label prop is not provided', () => {
      render(<WarningButton />);
      const button = screen.getByRole('button', { name: 'Warning' });
      expect(button).toBeInTheDocument();
    });
    
    test('uses provided label for aria-label when provided', () => {
      render(<WarningButton label="Custom Warning" />);
      const button = screen.getByRole('button', { name: 'Custom Warning' });
      expect(button).toBeInTheDocument();
    });
    
    test('applies custom className', () => {
      render(<WarningButton className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
    
    test('applies correct styles for different sizes', () => {
      const { rerender } = render(<WarningButton size="sm" />);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('w-8 h-8');
      
      rerender(<WarningButton size="md" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('w-10 h-10');
      
      rerender(<WarningButton size="lg" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('w-16 h-16');
    });
    
    test('applies correct styles for different variants', () => {
      const { rerender } = render(<WarningButton variant="filled" />);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500');
      
      rerender(<WarningButton variant="outline" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-red-500');
    });
  });

  describe('DashboardButton', () => {
    test('handles undefined onClick handler gracefully', () => {
      // Mock console.error to prevent React warnings about state updates
      const originalError = console.error;
      console.error = jest.fn();
      
      // Render with no onClick handler
      render(<DashboardButton data-testid="dashboard-btn" />);
      const button = screen.getByTestId('dashboard-btn');
      
      // Click should not throw an error
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
      
      console.error = originalError;
    });
    
    test('toggles active state on click', () => {
      render(<DashboardButton data-testid="dashboard-btn" />);
      const button = screen.getByTestId('dashboard-btn');
      
      // Initially white background
      expect(button).toHaveClass('bg-white');
      
      // Click to activate
      fireEvent.click(button);
      expect(button).toHaveClass('bg-blue-600');
      
      // Click again to deactivate
      fireEvent.click(button);
      expect(button).toHaveClass('bg-white');
    });
  });
  
  describe('FilterButton', () => {
    test('handles undefined onClick handler gracefully', () => {
      // Render with no onClick handler
      render(<FilterButton data-testid="filter-btn" />);
      const button = screen.getByTestId('filter-btn');
      
      // Initial state
      expect(button).toHaveAttribute('aria-label', 'Open filters');
      
      // Click should not throw an error
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
      
      // Button should change state despite no onClick handler
      expect(button).toHaveAttribute('aria-label', 'Close filters');
    });
    
    test('toggles active state and calls onClick when provided', () => {
      const handleClick = jest.fn();
      render(<FilterButton onClick={handleClick} data-testid="filter-btn" />);
      const button = screen.getByTestId('filter-btn');
      
      // Click to activate
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(button).toHaveAttribute('aria-label', 'Close filters');
      
      // Click again to deactivate
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(2);
      expect(button).toHaveAttribute('aria-label', 'Open filters');
    });
  });
  
  describe('WarningButton', () => {
    test('uses default aria-label when label is undefined', () => {
      render(<WarningButton />);
      const button = screen.getByRole('button', { name: 'Warning' });
      expect(button).toBeInTheDocument();
    });
    
    test('shows overlay and tooltip on hover', () => {
      render(<WarningButton />);
      const button = screen.getByRole('button');
      
      // Initial state - no overlay or tooltip
      expect(screen.queryByText('Waspada!')).not.toBeInTheDocument();
      expect(document.querySelector('.fixed.inset-0.bg-black')).not.toBeInTheDocument();
      
      // Hover to show overlay and tooltip
      fireEvent.mouseEnter(button);
      
      // Check overlay exists
      const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-40');
      expect(overlay).toBeInTheDocument();
      
      // Check tooltip content
      expect(screen.getByText('Waspada!')).toBeInTheDocument();
      expect(screen.getByText('Terdapat kasus penyakit menular di sekitarmu.')).toBeInTheDocument();
      
      // Mouse leave to hide overlay and tooltip
      fireEvent.mouseLeave(button);
      expect(screen.queryByText('Waspada!')).not.toBeInTheDocument();
      expect(document.querySelector('.fixed.inset-0.bg-black')).not.toBeInTheDocument();
    });
  });
