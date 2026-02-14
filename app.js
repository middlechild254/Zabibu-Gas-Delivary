const form = document.getElementById("orderForm");
const pinBtn = document.getElementById("pinLocation");
const mapContainer = document.getElementById("map");
let map, marker;

/* Phone validation: accepts 0732, 0113, +254 */
const phoneRegex = /^(?:\+254|0)(7\d{8}|1\d{8})$/;

/* =========================
   SHOW MAP AND PIN LOCATION
========================= */
pinBtn.addEventListener("click", () => {
  mapContainer.style.display = "block";

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (!map) {
        map = L.map("map").setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Allow user to click map to pin
        map.on("click", function (e) {
          const { lat, lng } = e.latlng;
          if (marker) map.removeLayer(marker);
          marker = L.marker([lat, lng]).addTo(map);
          form.lat.value = lat;
          form.lng.value = lng;
          form.address.value = `Pinned location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        });
      }

      map.setView([lat, lng], 15);

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);

      form.lat.value = lat;
      form.lng.value = lng;
      form.address.value = `Pinned location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    },
    () => alert("Location permission denied"),
    { enableHighAccuracy: true }
  );
});

/* =========================
   FORM SUBMIT → WHATSAPP
========================= */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const address = form.address.value.trim();
  const size = form.size.value;
  const qty = form.qty.value;
  const lat = form.lat.value;
  const lng = form.lng.value;

  if (name.length < 3) {
    alert("Enter your full name");
    return;
  }

  if (!phoneRegex.test(phone)) {
    alert("Enter a valid Kenyan phone number");
    return;
  }

  if (!lat || !lng) {
    alert("Please pin your location on the map");
    return;
  }

  /* WhatsApp message: include both typed address and map link */
  const messageText = `
NEW GAS ORDER
--------------------
Name: ${name}
Phone: ${phone}
Address: ${address}
Cylinder: ${size}
Quantity: ${qty}
Map Link: https://maps.google.com/?q=${lat},${lng}
--------------------
Sent from website
  `;

  const whatsappNumber = "254734272801"; // numbers only
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    messageText
  )}`;

  window.location.href = whatsappURL;
});
