import Razorpay from 'razorpay';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId) {
  throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not defined in environment variables.');
}

if (!keySecret) {
  throw new Error('RAZORPAY_KEY_SECRET is not defined in environment variables.');
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}); 