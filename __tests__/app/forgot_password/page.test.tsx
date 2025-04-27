import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordPage from "../../../app/forgot-password/page";
import { emailSubmitAPI } from '../../../services/api';

// Mock the API module
jest.mock('../../../services/api', () => ({
  emailSubmitAPI: {
    requestPasswordReset: jest.fn(),
  },
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forgot password page correctly', () => {
    render(<ForgotPasswordPage />);
    
    // Check for main elements
    expect(screen.getByText('Lupa Kata Sandi')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim/i })).toBeInTheDocument();
    expect(screen.getByAltText('Forgot Password Illustration')).toBeInTheDocument();
    expect(screen.getByText('Isi dengan email yang sudah terdaftar sebelumnya')).toBeInTheDocument();
  });

  // ADD THIS TEST - validates empty email
  it('validates empty email', () => {
    render(<ForgotPasswordPage />);
    
    // Submit form with empty email
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check for validation error
    const errorElement = screen.getByTestId('email-error');
    expect(errorElement).toHaveTextContent('Email tidak boleh kosong');
    expect(errorElement).toBeVisible();
  });

  // ADD THIS TEST - validates invalid email format
  it('validates invalid email format', () => {
    render(<ForgotPasswordPage />);
    
    // Enter invalid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check for validation error
    const errorElement = screen.getByTestId('email-error');
    expect(errorElement).toHaveTextContent('Format email tidak valid');
    expect(errorElement).toBeVisible();
  });

  // ADD THIS TEST - clears validation errors when entering valid email
  it('clears validation error when entering valid email after error', () => {
    render(<ForgotPasswordPage />);
    
    // First enter invalid email to trigger error
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Verify error is shown
    const errorElement = screen.getByTestId('email-error');
    expect(errorElement).toHaveTextContent('Format email tidak valid');
    expect(errorElement).toBeVisible();
    
    // Now enter valid email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Error should still be in DOM but hidden
    expect(errorElement).not.toBeVisible();
  });

  it('successfully submits the form with valid email', async () => {
    // Mock successful API response
    (emailSubmitAPI.requestPasswordReset as jest.Mock).mockResolvedValueOnce({ 
      success: true 
    });
    
    render(<ForgotPasswordPage />);
    
    // Enter valid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check for loading state
    expect(screen.getByText('Mengirim...')).toBeInTheDocument();
    
    // Wait for success message
    await waitFor(() => {
      const messageElement = screen.getByTestId('feedback-message');
      expect(messageElement).toHaveTextContent('Jika email terdaftar, kami telah mengirimkan link reset password ke email Anda.');
      expect(messageElement).toBeVisible();
    });
    
    // Verify API was called with correct email
    expect(emailSubmitAPI.requestPasswordReset).toHaveBeenCalledWith('valid@example.com');
    
    // Button should return to normal state
    expect(screen.getByRole('button', { name: /Kirim/i })).toBeInTheDocument();
  });

  it('handles API error with error message', async () => {
    // Mock API error response with specific message
    const errorMessage = 'Email tidak terdaftar';
    (emailSubmitAPI.requestPasswordReset as jest.Mock).mockResolvedValueOnce({ 
      success: false, 
      error: errorMessage 
    });
    
    render(<ForgotPasswordPage />);
    
    // Enter valid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Wait for error message
    await waitFor(() => {
      const messageElement = screen.getByTestId('feedback-message');
      expect(messageElement).toHaveTextContent(errorMessage);
      expect(messageElement).toBeVisible();
    });
  });

  it('handles API error without specific error message', async () => {
    // Mock API error response without specific message
    (emailSubmitAPI.requestPasswordReset as jest.Mock).mockResolvedValueOnce({ 
      success: false 
    });
    
    render(<ForgotPasswordPage />);
    
    // Enter valid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Wait for default error message
    await waitFor(() => {
      const messageElement = screen.getByTestId('feedback-message');
      expect(messageElement).toHaveTextContent('Terjadi kesalahan. Silakan coba lagi.');
      expect(messageElement).toBeVisible();
    });
  });

  it('handles network error', async () => {
    // Mock network error
    (emailSubmitAPI.requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );
    
    // Mock console.error to prevent test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ForgotPasswordPage />);
    
    // Enter valid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Wait for network error message
    await waitFor(() => {
      const messageElement = screen.getByTestId('feedback-message');
      expect(messageElement).toHaveTextContent('Terjadi kesalahan jaringan. Coba lagi nanti.');
      expect(messageElement).toBeVisible();
    });
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
});