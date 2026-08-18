// Replace the old mailto: submit handler in booking.html with this handler.
const BOOKING_API = 'https://YOUR-BACKEND-DOMAIN/api/bookings';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const service = document.querySelector('input[name="service"]:checked');
  if (!service) return alert('Please select a service.');
  const selectedPackage = packageSelect.options[packageSelect.selectedIndex];
  if (!selectedPackage || !selectedPackage.value) return alert('Please select a package.');

  const payload = {
    service: service.value,
    packageName: selectedPackage.value,
    price: selectedPackage.dataset.price || service.dataset.price,
    date: dateInput.value,
    time: timeInput.value,
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    business: document.getElementById('business').value.trim(),
    message: document.getElementById('message').value.trim()
  };

  const submitButton = form.querySelector('.submit');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending request...';

  try {
    const response = await fetch(BOOKING_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Booking submission failed.');

    form.style.display = 'none';
    document.getElementById('success').style.display = 'block';
    const successText = document.querySelector('#success p');
    if (successText) successText.textContent = `Your booking request (${result.bookingId}) has been received. The requested date and time will be checked before confirmation.`;
  } catch (error) {
    console.error(error);
    alert(error.message || 'Something went wrong. Please try again.');
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});
