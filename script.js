// TYPING
const words = [
  "Software Engineer",
  "Backend Developer",
  "Cloud Enthusiast",
  "Founder of Gid Paragon"
  ];
  
  let i = 0;
  let j = 0;
  let current = "";
  let isDeleting = false;
  
  function type() {
  current = words[i];
  
  if (!isDeleting) j++;
  else j--;
  
  document.getElementById("typing").textContent =
  current.substring(0, j);
  
  if (!isDeleting && j === current.length) {
  isDeleting = true;
  setTimeout(type, 1000);
  return;
  }
  
  if (isDeleting && j === 0) {
  isDeleting = false;
  i = (i + 1) % words.length;
  }
  
  setTimeout(type, isDeleting ? 60 : 100);
  }
  
  type();
  
  
  // SCROLL REVEAL
  const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
  if (entry.isIntersecting) {
  entry.target.classList.add("active");
  }
  });
  });
  
  document.querySelectorAll(".reveal").forEach(el => {
  observer.observe(el);
  });
  
  
  // MOBILE MENU
  document.getElementById("menu").onclick = () => {
  document.getElementById("nav-links").classList.toggle("show");
  };
  
  
  // CONTACT (simple success feedback)
  document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  alert("Message sent successfully (demo mode)");
  });