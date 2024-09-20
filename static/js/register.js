// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the role select dropdown and form elements
    var rolesSelect = document.getElementById('roles');
    var adminForm = document.getElementById('admin_form');
    var userForm = document.getElementById('user_form');
    var managerForm = document.getElementById('manager_form');

    // Function to handle form visibility based on selected role
    function handleFormVisibility() {
        var selectedRole = rolesSelect.value; // Get the selected role

        // Hide all forms initially
        adminForm.style.display = 'none';
        userForm.style.display = 'none';
        managerForm.style.display = 'none';

        // Show the relevant form based on the selected role
        if (selectedRole === 'admin') {
            adminForm.style.display = 'block';
        } else if (selectedRole === 'user') {
            userForm.style.display = 'block';
        } else if (selectedRole === 'manager') {
            managerForm.style.display = 'block';
        }
    }

    // Check local storage for the last selected role and set it
    var lastSelectedRole = localStorage.getItem('lastSelectedRole');
    if (lastSelectedRole) {
        rolesSelect.value = lastSelectedRole; // Restore last selected role
    }
    handleFormVisibility(); // Show the appropriate form on page load

    // Add event listener to update form visibility when the role changes
    rolesSelect.addEventListener('change', function() {
        handleFormVisibility(); // Update form visibility
        localStorage.setItem('lastSelectedRole', rolesSelect.value); // Save the selected role to local storage
    });
});

// Function to validate the selected role's form inputs
function validateForm() {
    var rolesSelect = document.getElementById('roles'); // Get the role select element
    var selectedRole = rolesSelect.value; // Get the selected role

    // Validation logic for admin role
    if (selectedRole === 'admin') {
        var email = document.getElementById("admin_email").value;
        var username = document.getElementById("admin_name").value;
        var password = document.getElementById("password").value;
        var confirm_password = document.getElementById("confirm_password").value;

        // Define regex patterns for validation
        var emailRegex = /^\S+@\S+\.[a-zA-Z]{2,3}$/; // Email pattern
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/; // Username pattern
        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // Password pattern

        var isValid = true; // Initialize validity flag

        // Validate email format
        if (!emailRegex.test(email)) {
            document.getElementById("emailError").innerHTML = "Invalid email format";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("emailError").innerHTML = ""; // Clear error message
        }

        // Validate username
        if (!usernameRegex.test(username)) {
            document.getElementById("usernameError").innerHTML = "Username must be at least 5 characters long and can only contain letters, numbers, and underscore";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("usernameError").innerHTML = ""; // Clear error message
        }

        // Validate password
        if (!passwordRegex.test(password)) {
            document.getElementById("passwordError").innerHTML = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("passwordError").innerHTML = ""; // Clear error message
        }

        // Check if passwords match
        if (password !== confirm_password) {
            document.getElementById("confirmPasswordError").innerHTML = "Passwords do not match";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("confirmPasswordError").innerHTML = ""; // Clear error message
        }

        return isValid; // Return overall validity

    // Validation logic for user role
    } else if (selectedRole === 'user') {
        var email = document.getElementById("emp_email").value;
        var username = document.getElementById("emp_name").value;
        var password = document.getElementById("EmpPassword").value;
        var confirm_password = document.getElementById("EmpConfirmPassword").value;

        // Define regex patterns for validation
        var emailRegex = /^\S+@\S+\.[a-zA-Z]{2,3}$/; // Email pattern
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/; // Username pattern
        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // Password pattern

        var isValid = true; // Initialize validity flag

        // Validate email format
        if (!emailRegex.test(email)) {
            document.getElementById("EmpEmailError").innerHTML = "Invalid email format";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("EmpEmailError").innerHTML = ""; // Clear error message
        }

        // Validate username
        if (!usernameRegex.test(username)) {
            document.getElementById("EmpUsernameError").innerHTML = "Username must be at least 5 characters long and can only contain letters, numbers, and underscore";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("EmpUsernameError").innerHTML = ""; // Clear error message
        }

        // Validate password
        if (!passwordRegex.test(password)) {
            document.getElementById("EmpPasswordError").innerHTML = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("EmpPasswordError").innerHTML = ""; // Clear error message
        }

        // Check if passwords match
        if (password !== confirm_password) {
            document.getElementById("EmpConfirmPasswordError").innerHTML = "Passwords do not match";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("EmpConfirmPasswordError").innerHTML = ""; // Clear error message
        }

        return isValid; // Return overall validity

    // Validation logic for manager role
    } else if (selectedRole === 'manager') {
        var email = document.getElementById("mgr_email").value;
        var username = document.getElementById("mgr_name").value;
        var password = document.getElementById("MgrPassword").value;
        var confirm_password = document.getElementById("MgrConfirmPassword").value;

        // Define regex patterns for validation
        var emailRegex = /^\S+@\S+\.[a-zA-Z]{2,3}$/; // Email pattern
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/; // Username pattern
        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; // Password pattern

        var isValid = true; // Initialize validity flag

        // Validate email format
        if (!emailRegex.test(email)) {
            document.getElementById("MgrEmailError").innerHTML = "Invalid email format";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("MgrEmailError").innerHTML = ""; // Clear error message
        }

        // Validate username
        if (!usernameRegex.test(username)) {
            document.getElementById("MgrNameError").innerHTML = "Username must be at least 5 characters long and can only contain letters, numbers, and underscore";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("MgrNameError").innerHTML = ""; // Clear error message
        }

        // Validate password
        if (!passwordRegex.test(password)) {
            document.getElementById("MgrPasswordError").innerHTML = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("MgrPasswordError").innerHTML = ""; // Clear error message
        }

        // Check if passwords match
        if (password !== confirm_password) {
            document.getElementById("MgrConfirmPasswordError").innerHTML = "Passwords do not match";
            isValid = false; // Mark as invalid
        } else {
            document.getElementById("MgrConfirmPasswordError").innerHTML = ""; // Clear error message
        }

        return isValid; // Return overall validity
    }
}

// Set a timeout to hide error messages after 2 seconds
setTimeout(function() {
    document.getElementById('usernameError').style.display = 'none';
    document.getElementById('emailError').style.display = 'none';
    document.getElementById('invalid_email').style.display = 'none';
    document.getElementById('invalid_emp_email').style.display = 'none';
    document.getElementById('passwordError').style.display = 'none';
    document.getElementById('confirmPasswordError').style.display = 'none';
    document.getElementById('EmpUsernameError').style.display = 'none';
    document.getElementById('EmpEmailError').style.display = 'none';
    document.getElementById('EmpPasswordError').style.display = 'none';
    document.getElementById('EmpConfirmPasswordError').style.display = 'none';
    document.getElementById('MgrNameError').style.display = 'none';
    document.getElementById('MgrEmailError').style.display = 'none';
    document.getElementById('invalid_mgr_email').style.display = 'none';
    document.getElementById('MgrPasswordError').style.display = 'none';
    document.getElementById('MgrConfirmPasswordError').style.display = 'none';
}, 2000);
