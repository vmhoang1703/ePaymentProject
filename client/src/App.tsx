import { useEffect, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { checkUserSession } from './store/user/user.action';
import Spinner from './components/spinner/spinner.component';
import { GlobalStyle } from './global.styles';
import ThankYou from './routes/thankyou/thankyou.component';

const Navigation = lazy(
  () => import('./routes/navigation/navigation.component'),
);
const Home = lazy(() => import('./routes/home/home.component'));
const Authentication = lazy(
  () => import('./routes/authentication/authentication.component'),
);
const Shop = lazy(() => import('./routes/shop/shop.component'));
const Checkout = lazy(() => import('./routes/checkout/checkout.component'));
const Payment = lazy(() => import('./routes/payment/payment.component'));

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkUserSession());
  }, [dispatch]);

  return (
    <Suspense fallback={<Spinner />}>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />
          <Route path="shop/*" element={<Shop />} />
          <Route path="auth" element={<Authentication />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/payment" element={<Payment />} />
          <Route path="checkout/payment/thanks" element={<ThankYou />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
