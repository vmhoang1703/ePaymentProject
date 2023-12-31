import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  CartElementContainer,
  FormContainer,
  PaymentFormContainer,
} from './payment-form.styles';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartTotal } from '../../store/cart/cart.selector';
import { selectCurrentUser } from '../../store/user/user.selector';
import { ChangeEvent, FormEvent, Fragment, useState } from 'react';
import { StripeCardElement } from '@stripe/stripe-js';
import FormInput from '../form-input/form-input.component';
import { setCartItems } from '../../store/cart/cart.action';
import { useNavigate } from 'react-router-dom';
import Modal from '../modal/modal.component';

const ifValidCardElement = (
  card: StripeCardElement | null,
): card is StripeCardElement => card !== null;

const defaultFormVFalue = {
  name: '',
  email: '',
};

const PaymentForm = ({
  isOpen,
  handleOpen,
}: {
  isOpen: boolean;
  handleOpen: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const amount = useSelector(selectCartTotal);
  const currentUser = useSelector(selectCurrentUser);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formValue, setFormValue] = useState(defaultFormVFalue);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValue({ ...formValue, [name]: value });
  };

  const paymentHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setIsProcessingPayment(true);

    const reponse = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amount * 100 }),
    }).then((res) => res.json());

    const {
      paymentIntent: { client_secret },
    } = reponse;

    const cartDetails = elements.getElement(CardElement);

    if (!ifValidCardElement(cartDetails)) return;

    const paymentResult = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: cartDetails,
        billing_details: {
          name: currentUser ? currentUser.displayName : formValue.name,
          email: currentUser ? currentUser.email : formValue.email,
          address: {
            city: 'Ho Chi Minh',
            country: 'VN',
            line1: '123 ABC',
            line2: '123 ABC',
            postal_code: '700000',
            state: 'Ho Chi Minh',
          },
        },
      },
    });

    setIsProcessingPayment(false);

    if (paymentResult.error) {
      alert(paymentResult.error.message);
    } else {
      if (paymentResult.paymentIntent.status === 'succeeded') {
        dispatch(setCartItems([]));
        navigate('/checkout/payment/thanks');
      }
    }
  };

  return (
    <Modal
      isLoading={isProcessingPayment}
      handleConfirm={paymentHandler}
      modalTitle="Pay with card"
      isOpen={isOpen}
      handleOpen={handleOpen}
    >
      <PaymentFormContainer>
        <FormContainer>
          {currentUser ? (
            <Fragment>
              <p>Name: {currentUser.displayName}</p>
              <p>Email: {currentUser.email}</p>
            </Fragment>
          ) : (
            <Fragment>
              <FormInput
                label="Name"
                required
                name="name"
                value={formValue.name}
                type="text"
                onChange={(e) => handleChange(e)}
              />
              <FormInput
                label="Email"
                required
                name="email"
                value={formValue.email}
                type="email"
                onChange={(e) => handleChange(e)}
              />
            </Fragment>
          )}
          <CartElementContainer>
            <CardElement />
          </CartElementContainer>
        </FormContainer>
      </PaymentFormContainer>
    </Modal>
  );
};

export default PaymentForm;
