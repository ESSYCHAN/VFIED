// frontend/src/tests/payment/payment-flows.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import JobPostingPayment from '../../components/employer/JobPostingPayment';
import VerificationPayment from '../../components/credentials/VerificationPayment';
import { MockedAuthProvider } from '../mocks/auth-provider';

// Mock Stripe for testing
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => children,
  useStripe: () => ({
    confirmCardPayment: jest.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded' } })
  }),
  useElements: () => ({
    getElement: jest.fn()
  }),
  CardElement: () => <div data-testid="card-element" />
}));

describe('Payment Flow Tests', () => {
  test('Job posting payment renders correctly', async () => {
    render(
      <MockedAuthProvider>
        <JobPostingPayment 
          requisitionId="test-req-id"
          onPaymentComplete={jest.fn()}
          onPaymentError={jest.fn()}
        />
      </MockedAuthProvider>
    );
    
    expect(screen.getByText(/Pay & Publish Job/i)).toBeInTheDocument();
    expect(screen.getByTestId("card-element")).toBeInTheDocument();
  });
  
  test('Verification payment handles completion', async () => {
    const mockComplete = jest.fn();
    
    render(
      <MockedAuthProvider>
        <VerificationPayment 
          credentialId="test-cred-id"
          onPaymentComplete={mockComplete}
          onPaymentError={jest.fn()}
        />
      </MockedAuthProvider>
    );
    
    fireEvent.click(screen.getByText(/Pay Verification Fee/i));
    
    await waitFor(() => {
      expect(mockComplete).toHaveBeenCalled();
    });
  });
});