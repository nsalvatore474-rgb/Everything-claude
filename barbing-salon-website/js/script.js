// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.4)' : 'none';
});

// Booking form (demo submission, no backend)
const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.classList.add('visible');
  bookingForm.reset();
  setTimeout(() => formSuccess.classList.remove('visible'), 6000);
});

// Prevent selecting a past date
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
