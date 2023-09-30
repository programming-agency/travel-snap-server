const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51NmGJKLGhlQCJ0D8lCmljPUaO84YIPNmQFPuZrtcRXpQp4i6i9UChY7DlF9Ijx5UmMnxk9dYcaFGxjbpCIYr1O5D00SGVOo95S');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
