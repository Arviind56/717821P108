const express = require('express');
const app = express();
const sizer = 10;
let winprevval = [];

const session1 = require('express-session');


app.use(session1({
  secret: 'pointer',
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  const timeoutDuration = 500; 
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    next(new Error('Request timed out'));
  }, timeoutDuration);

  const original = res.end;
  res.end = function () {
    clearTimeout(timeoutId);
    original.apply(this, arguments);
  };

  next();
});

app.get('/e', async (req, res) => {
  try {
    const numbers = await fetch('http://20.244.56.144/numbers/even').then((response) => response.json());
    let currenter = [];

    if (numbers.numbers.length > sizer) {
      for (let i = sizer - 1; i >= 0; i--) {
        currenter[i] = numbers.numbers[i];
      }
    } else {
      currenter = numbers.numbers;
    }

    const sum = currenter.reduce((acc, val) => acc + val, 0);
    const avg = sum / numbers.numbers.length;

    res.json({
      "windowsPrevState": winprevval,
      "windowCurrState": currenter,
      "numbers": numbers.numbers,
      "avg": avg
    });

    winprevval = currenter;
    req.session.prevstate = winprevval;
  } catch (error) {
    res.json({ error: `above 500 millisecond exceeded` });
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
