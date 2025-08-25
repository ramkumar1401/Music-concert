window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  loadingScreen.style.transition = 'opacity 0.5s ease';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 500);
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

hamburger.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    navLinks.classList.toggle('active');
  }
});

document.querySelectorAll('.nav-anchor').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target.getAttribute('href');
    if (target && target.startsWith('#')) {
      document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
      if (navLinks.classList.contains('active')) navLinks.classList.remove('active');
    }
  });
});

const bookingForm = document.getElementById('bookingFormElement');
const otpInput = document.getElementById('otp');
const otpLabel = document.getElementById('otpLabel');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const otpMessage = document.getElementById('otpMessage');
const ticketTypeSelect = document.getElementById('ticketType');
const quantityInput = document.getElementById('quantity');
const calculatedPriceDiv = document.getElementById('calculatedPrice');
const paymentForm = document.getElementById('paymentForm');
const paymentMessage = document.getElementById('paymentMessage');

let generatedOtp = '';
let otpSent = false;
let bookingConfirmed = false;
let otpTimer = null;

const PRICING = { 'General': 3999, 'VIP': 11999 };

function updatePrice() {
  const ticketType = ticketTypeSelect.value;
  const quantity = Math.min(Math.max(parseInt(quantityInput.value), 1), 10) || 1;
  const total = PRICING[ticketType] * quantity;
  calculatedPriceDiv.textContent = `Total Price: ₹${total.toLocaleString()}`;
}

ticketTypeSelect.addEventListener('change', updatePrice);
quantityInput.addEventListener('input', updatePrice);
updatePrice();

function sendOtp(phone) {
  if (otpSent) {
    otpMessage.style.color = 'blue';
    otpMessage.innerText = 'OTP already sent, please check and enter OTP.';
    return;
  }
  otpSent = true;
  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  alert(`Simulated OTP sent to ${phone}: ${generatedOtp}`);

  otpMessage.style.color = 'green';
  otpMessage.innerText = `OTP sent! Please enter it above. OTP expires in 60 seconds.`;

  otpInput.style.display = 'block';
  otpLabel.style.display = 'block';
  verifyOtpBtn.style.display = 'inline-block';
  verifyOtpBtn.disabled = false;
  otpInput.focus();

  let countdown = 60;
  otpTimer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      otpMessage.innerText = `OTP sent! Please enter it above. OTP expires in ${countdown} seconds.`;
    } else {
      clearInterval(otpTimer);
      otpTimer = null;
      otpMessage.style.color = 'red';
      otpMessage.innerText = 'OTP expired. Please book again.';
      resetBookingForm();
    }
  }, 1000);
}

function resetBookingForm() {
  bookingForm.reset();
  otpInput.style.display = 'none';
  otpLabel.style.display = 'none';
  verifyOtpBtn.style.display = 'none';
  bookingForm.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
  otpSent = false;
  bookingConfirmed = false;
  paymentForm.style.display = 'none';
  paymentMessage.textContent = '';
  if (otpTimer) {
    clearInterval(otpTimer);
    otpTimer = null;
  }
  updatePrice();
}

bookingForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (!otpSent) {
    const phone = this.phone.value.trim();
    if (!phone.startsWith('+') || phone.length < 10) {
      alert('Please enter a valid phone number with country code, e.g., +919876543210');
      return;
    }
    bookingForm.querySelectorAll('input, select, button').forEach(el => {
      if (el !== otpInput && el !== verifyOtpBtn) el.disabled = true;
    });
    sendOtp(phone);
  } else {
    otpMessage.style.color = 'red';
    otpMessage.innerText = 'OTP already sent. Please enter and verify OTP.';
  }
});

verifyOtpBtn.addEventListener('click', function () {
  const enteredOtp = otpInput.value.trim();
  if (enteredOtp === generatedOtp && !bookingConfirmed) {
    bookingConfirmed = true;
    if (otpTimer) {
      clearInterval(otpTimer);
      otpTimer = null;
    }
    otpMessage.style.color = 'green';
    otpMessage.innerText = 'OTP verified successfully! Please complete payment to confirm booking.';

    paymentForm.style.display = 'block';

    bookingForm.querySelectorAll('input, select, button').forEach(el => {
      if (el !== otpInput && el !== verifyOtpBtn) el.disabled = true;
    });
  } else {
    otpMessage.style.color = 'red';
    otpMessage.innerText = 'Invalid OTP. Please try again.';
  }
});

paymentForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const cardName = paymentForm.cardName.value.trim();
  const cardNumber = paymentForm.cardNumber.value.replace(/\s+/g, '');
  const expiry = paymentForm.expiry.value;
  const cvv = paymentForm.cvv.value.trim();

  if (!cardName || cardNumber.length < 16 || !expiry || cvv.length < 3) {
    paymentMessage.style.color = 'red';
    paymentMessage.innerText = 'Please enter valid payment details.';
    return;
  }

  paymentMessage.style.color = 'green';
  paymentMessage.innerText = 'Payment successful! Booking confirmed. Redirecting...';

  const name = bookingForm.name.value.trim();
  const ticketType = bookingForm.ticketType.value;
  const quantity = bookingForm.quantity.value;

  const eventTime = new Date();
  eventTime.setHours(18, 30, 0, 0);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = eventTime.toLocaleDateString(undefined, options);
  const timeStr = eventTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const bookingData = {
    name,
    ticketType,
    quantity,
    dateStr,
    timeStr,
  };
  localStorage.setItem('bookingData', JSON.stringify(bookingData));

  setTimeout(() => {
    window.location.href = 'confirmation.html';
  }, 2000);
});

// Contact form
const contactForm = document.getElementById('contactForm');
const contactResponse = document.getElementById('contactResponse');
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = this.contactName.value.trim();
  const email = this.contactEmail.value.trim();
  const message = this.contactMessage.value.trim();

  if (!name || !email || !message) {
    contactResponse.style.color = 'red';
    contactResponse.innerText = 'Please fill in all fields.';
    return;
  }
  contactResponse.style.color = 'green';
  contactResponse.innerText = 'Thank you for reaching out! We will get back to you soon.';
  contactForm.reset();
});
