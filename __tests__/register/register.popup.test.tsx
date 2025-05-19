/* __tests__/register/register.popup.test.tsx */

/* ------------------------------------------------------------------ */
/* 1️⃣  Module mocks (no external references)                          */
/* ------------------------------------------------------------------ */
jest.mock('../../services/authService', () => {
  const registerMock = jest.fn();                 // created inside factory
  return {
    __esModule: true,
    authService: { register: registerMock },
    _registerMock: registerMock,                  // re-export for tests
  };
});

jest.mock('next/navigation', () => {
  const push = jest.fn();
  return { __esModule: true, useRouter: () => ({ push }), _push: push };
});

jest.mock('../../hooks/useRegistrationFormValidation', () => ({
  useRegistrationFormValidation: () => ({
    errors: {},
    validateForm: () => true,
    sanitizeInput: (v: string) => v,
    getPasswordValidationResult: () => ({ score: 4, feedback: [] }),
  }),
}));

jest.mock('../../hooks/useRateLimit', () => ({
  useRateLimit: () => ({
    checkRateLimit: () => ({ isAllowed: true, timeLeft: 0 }),
    addAttempt: jest.fn(),
  }),
}));

/* ------------------------------------------------------------------ */
/* 2️⃣  Imports AFTER mocks                                            */
/* ------------------------------------------------------------------ */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../../app/register/page';
import '@testing-library/jest-dom';

const { _registerMock } = require('../../services/authService');
const { _push } = require('next/navigation');

/* ------------------------------------------------------------------ */
/*                       Test-only constants                           */
/* ------------------------------------------------------------------ */
const TEST = {
  FIRST_NAME: 'Pop',
  LAST_NAME: 'Up',
  EMAIL: 'popup@example.com',
  PASSWORD: 'TestPass123!', //NOSONAR
} as const;

/* ------------------------------------------------------------------ */
/* Helper to fill the form quickly                                    */
/* ------------------------------------------------------------------ */
function fillForm() {
  fireEvent.change(screen.getByLabelText('Nama Depan'), {
    target: { value: TEST.FIRST_NAME },
  });
  fireEvent.change(screen.getByLabelText('Nama Belakang'), {
    target: { value: TEST.LAST_NAME },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: TEST.EMAIL },
  });
  fireEvent.change(screen.getByLabelText('Kata Sandi'), {
    target: { value: TEST.PASSWORD },
  });
  fireEvent.change(screen.getByLabelText('Konfirmasi Kata Sandi'), {
    target: { value: TEST.PASSWORD },
  });
}

/* ------------------------------------------------------------------ */
/*                               Tests                                */
/* ------------------------------------------------------------------ */
describe('RegisterPage – popup success flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows success popup and pushes /login after OK', async () => {
    // Arrange backend success
    _registerMock.mockResolvedValueOnce({
      detail: 'A verification email has been sent to popup@example.com',
    });

    render(<RegisterPage />);
    fillForm();

    /* Submit */
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));

    /* Popup appears with backend message */
    const popupText = await screen.findByText(/verification email has been sent/i);
    expect(popupText).toBeInTheDocument();

    /* Click OK button inside popup */
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    /* Popup disappears */
    await waitFor(() =>
      expect(
        screen.queryByText(/verification email has been sent/i)
      ).not.toBeInTheDocument()
    );

    /* Router redirected once to /login */
    expect(_push).toHaveBeenCalledTimes(1);
    expect(_push).toHaveBeenCalledWith('/login');
  });
});
