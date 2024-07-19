document.addEventListener("DOMContentLoaded", () => {
    // Get references to various DOM elements
    const membersList = document.getElementById("members");
    const filterButton = document.getElementById("filter-button");
    const memberForm = document.getElementById("member-form");
    const feedback = document.getElementById("feedback");
  
    // Helper function to add event listeners to elements
    const addEventOnElem = function (elem, type, callback) {
      if (elem.length > 1) {
        for (let i = 0; i < elem.length; i++) {
          elem[i].addEventListener(type, callback);
        }
      } else {
        elem.addEventListener(type, callback);
      }
    };
  
    // Get references to navbar-related elements
    const navbar = document.querySelector("[data-navbar]");
    const navTogglers = document.querySelectorAll("[data-nav-toggler]");
    const navLinks = document.querySelectorAll("[data-nav-link]");
  
    // Toggle the navbar when the toggler is clicked
    const toggleNavbar = function () {
      navbar.classList.toggle("active");
    };
  
    addEventOnElem(navTogglers, "click", toggleNavbar);
  
    // Close the navbar when a nav link is clicked
    const closeNavbar = function () {
      navbar.classList.remove("active");
    };
  
    addEventOnElem(navLinks, "click", closeNavbar);
  
    // Get references to header and back-to-top button
    const header = document.querySelector("[data-header]");
    const backTopBtn = document.querySelector("[data-back-top-btn]");
  
    // Add a scroll event listener to the window
    window.addEventListener("scroll", function () {
      // Add/remove active class to header and back-to-top button based on scroll position
      if (window.scrollY >= 100) {
        header.classList.add("active");
        backTopBtn.classList.add("active");
      } else {
        header.classList.remove("active");
        backTopBtn.classList.remove("active");
      }
    });
  
    // Show feedback message with success or error class
    const showFeedback = (message, isError = false) => {
      feedback.textContent = message;
      feedback.className = isError ? 'error' : 'success';
      feedback.style.display = 'block';
      setTimeout(() => {
        feedback.style.display = 'none';
      }, 3000);
    };
  
    // Fetch members from the server
    const fetchMembers = () => {
      fetch("http://localhost:3000/members")
        .then(response => response.json())
        .then(members => displayMembers(members))
        .catch(error => {
          console.error("Error fetching members:", error);
          showFeedback("Error fetching members. Please try again later.", true);
        });
    };
  
    // Display members in the members list
    const displayMembers = (members) => {
      membersList.innerHTML = "";
      members.forEach((member) => {
        const li = document.createElement("li");
        li.textContent = `${member.name} - ${member['membership-expiry']} - ${member.workout}`;
        li.appendChild(createEditButton(member));
        li.appendChild(createDeleteButton(member.id));
        membersList.appendChild(li);
      });
    };
  
    // Create a delete button for each member
    const createDeleteButton = (id) => {
      const button = document.createElement("button");
      button.textContent = "Delete";
      button.classList.add('delete-button');
      button.addEventListener("click", () => {
        fetch(`http://localhost:3000/members/${id}`, {
          method: "DELETE"
        })
        .then(() => {
          fetchMembers();
          showFeedback("Member deleted successfully.");
        })
        .catch(error => {
          console.error("Error deleting member:", error);
          showFeedback("Error deleting member. Please try again later.", true);
        });
      });
      return button;
    };
  
    // Create an edit button for each member
    const createEditButton = (member) => {
      const button = document.createElement("button");
      button.textContent = "Edit";
      button.classList.add('edit-button');
      button.addEventListener("click", () => {
        editMember(member);
      });
      return button;
    };
  
    // Populate the form fields with the selected member's data
    const editMember = (member) => {
      document.getElementById("name").value = member.name;
      document.getElementById("membership-expiry").value = member['membership-expiry'];
      document.getElementById("workout").value = member.workout;
      document.getElementById("member-id").value = member.id;
    };
  
    // Handle form submission for creating or updating a member
    memberForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("member-id").value;
      const name = document.getElementById("name").value.trim();
      const membershipEnd = document.getElementById("membership-end").value;
      const favoriteWorkout = document.getElementById("favorite-workout").value.trim();
  
      // Validate form fields
      if (!name || !membershipEnd || !favoriteWorkout) {
        showFeedback("Please fill out all fields.", true);
        return;
      }
  
      // Prepare member data
      const memberData = {
        name,
        'membership-expiry': membershipEnd,
        workout: favoriteWorkout
      };
  
      let request;
      if (id) {
        // Update existing member
        request = fetch(`http://localhost:3000/members/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(memberData)
        });
      } else {
        // Create a new member
        request = fetch("http://localhost:3000/members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(memberData)
        });
      }
  
      // Send the request and handle the response
      request
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to save member.");
          }
          return response.json();
        })
        .then(() => {
          fetchMembers();
          memberForm.reset();
          showFeedback("Member saved successfully.");
        })
        .catch(error => {
          console.error("Error saving member:", error);
          showFeedback("Error saving member. Please try again later.", true);
        });
    });
  
    // Handle filtering members by membership expiry date
    filterButton.addEventListener("click", () => {
      const filterDate = document.getElementById("filter-date").value;
      if (!filterDate) {
        showFeedback("Please select a date to filter by.", true);
        return;
      }
  
      fetch("http://localhost:3000/members")
        .then(response => response.json())
        .then(members => {
          const filteredMembers = members.filter(member =>
            new Date(member['membership-expiry']) <= new Date(filterDate)
          );
          displayFilteredMembers(filteredMembers);
          showFeedback(`${filteredMembers.length} member(s) found.`);
        })
        .catch(error => {
          console.error("Error filtering members:", error);
          showFeedback("Error filtering members. Please try again later.", true);
        });
    });
  
    // Display filtered members in the filtered members list
    const displayFilteredMembers = (members) => {
      const filteredMembersList = document.getElementById("filtered-members");
      filteredMembersList.innerHTML = "";
      members.forEach((member) => {
        const li = document.createElement("li");
        li.textContent = `${member.name} - ${member['membership-expiry']} - ${member.workout}`;
        filteredMembersList.appendChild(li);
      });
    };
  
    // Fetch and display members when the page loads
    fetchMembers();
  })