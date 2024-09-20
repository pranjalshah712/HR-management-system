document.addEventListener('DOMContentLoaded', function() {
    var rolesSelect = document.getElementById('roles');
    var adminForm = document.getElementById('admin_form');
    var userForm = document.getElementById('user_form');
    var managerForm = document.getElementById('manager_form');

    function handleFormVisibility() {
        var selectedRole = rolesSelect.value;

        adminForm.style.display = 'none';
        userForm.style.display = 'none';
        managerForm.style.display = 'none';

        if (selectedRole === 'admin') {
            adminForm.style.display = 'block';
        } else if (selectedRole === 'user') {
            userForm.style.display = 'block';
        } else if (selectedRole === 'manager') {
            managerForm.style.display = 'block';
        }
    }

    var lastSelectedRole = localStorage.getItem('lastSelectedRole');
    if (lastSelectedRole) {
        rolesSelect.value = lastSelectedRole;
    }
    handleFormVisibility();

    rolesSelect.addEventListener('change', function() {
        handleFormVisibility();
        localStorage.setItem('lastSelectedRole', rolesSelect.value);
    });
});





function validateForm() {

    var rolesSelect = document.getElementById('roles');
    var selectedRole = rolesSelect.value;

    if (selectedRole === 'admin') {
        var email = document.getElementById("admin_email").value;
        var username = document.getElementById("admin_name").value;
        var password = document.getElementById("password").value;
        var confirm_password = document.getElementById("confirm_password").value;

        var emailRegex = /^\S+@\S+\.[a-zA-Z]{2,3}$/;
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        var isValid = true;

        if (!emailRegex.test(email)) {
            document.getElementById("emailError").innerHTML = "Invalid email format";
            isValid = false;
        } else {
            document.getElementById("emailError").innerHTML = "";
        }

        if (!usernameRegex.test(username)) {
            document.getElementById("usernameError").innerHTML = "Username must be at least 5 characters long and can only contain letters, numbers, and underscore";
            isValid = false;
        } else {
            document.getElementById("usernameError").innerHTML = "";
        }

        if (!passwordRegex.test(password)) {
            document.getElementById("passwordError").innerHTML = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter";
            isValid = false;
        } else {
            document.getElementById("passwordError").innerHTML = "";
        }

        if (password !== confirm_password) {
            document.getElementById("confirmPasswordError").innerHTML = "Passwords do not match";
            isValid = false;
        } else {
            document.getElementById("confirmPasswordError").innerHTML = "";
        }

        return isValid;


    } else if (selectedRole === 'user') {
        var email = document.getElementById("emp_email").value;
        var username = document.getElementById("emp_name").value;
        var password = document.getElementById("EmpPassword").value;
        var confirm_password = document.getElementById("EmpConfirmPassword").value;


        var emailRegex = /^\S+@\S+\.[a-zA-Z]{2,3}$/;
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        var isValid = true;

        if (!emailRegex.test(email)) {
            document.getElementById("EmpEmailError").innerHTML = "Invalid email format";
            isValid = false;
        } else {
            document.getElementById("EmpEmailError").innerHTML = "";
        }

        if (!usernameRegex.test(username)) {
            document.getElementById("EmpUsernameError").innerHTML = "Username must be at least 5 characters long and can only contain letters, numbers, and underscore";
            isValid = false;
        } else {
            document.getElementById("EmpUsernameError").innerHTML = "";
        }

        if (!passwordRegex.test(password)) {
            document.getElementById("EmpPasswordError").innerHTML = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter";
            isValid = false;
        } else {
            document.getElementById("EmpPasswordError").innerHTML = "";
        }

        if (password !== confirm_password) {
            document.getElementById("EmpConfirmPasswordError").innerHTML = "Passwords do not match";
            isValid = false;
        } else {
            document.getElementById("EmpConfirmPasswordError").innerHTML = "";
        }

        return isValid;

    } else if (selectedRole === 'manager') {
        var email = document.getElementById("mgr_email").value;
        var username = document.getElementById("mgr_name").value;
        var password = document.getElementById("MgrPassword").value;
        var confirm_password = document.getElementById("MgrConfirmPassword").value;
        }

        var emailRegex = /^\S+@\S+\.[a-zA-Z]{2,3}$/;
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
        var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        var isValid = true;

        if (!emailRegex.test(email)) {
            document.getElementById("MgrEmailError").innerHTML = "Invalid email format";
            isValid = false;
        } else {
            document.getElementById("MgrEmailError").innerHTML = "";
        }

        if (!usernameRegex.test(username)) {
            document.getElementById("MgrNameError").innerHTML = "Username must be at least 5 characters long and can only contain letters, numbers, and underscore";
            isValid = false;
        } else {
            document.getElementById("MgrNameError").innerHTML = "";
        }

        if (!passwordRegex.test(password)) {
            document.getElementById("MgrEmailError").innerHTML = "Password must be at least 8 characters long and contain at least one digit, one lowercase letter, and one uppercase letter";
            isValid = false;
        } else {
            document.getElementById("MgrEmailError").innerHTML = "";
        }

        if (password !== confirm_password) {
            document.getElementById("MgrConfirmPasswordError").innerHTML = "Passwords do not match";
            isValid = false;
        } else {
            document.getElementById("MgrConfirmPasswordError").innerHTML = "";
        }

        return isValid;
}


    setTimeout(function() {
        document.getElementById('usernameError').style.display = 'none';
        document.getElementById('emailError').style.display = 'none';
        document.getElementById('invalid_email').style.display = 'none';
        document.getElementById('invalid_emp_email').style.display = 'none';
        document.getElementById('passwordError').style.display = 'none';
        document.getElementById('confirmPasswordError').style.display = 'none';
        document.getElementById('EmpUsernameError').style.display = 'none';
        document.getElementById('EmpEmailError').style.display = 'none';
//        document.getElementById('invalid_mgr_id').style.display = 'none';
        document.getElementById('EmpPasswordError').style.display = 'none';
        document.getElementById('EmpConfirmPasswordError').style.display = 'none';
        document.getElementById('MgrNameError').style.display = 'none';
        document.getElementById('MgrEmailError').style.display = 'none';
        document.getElementById('invalid_mgr_email').style.display = 'none';
        document.getElementById('MgrPasswordError').style.display = 'none';
        document.getElementById('MgrConfirmPasswordError').style.display = 'none';
    }, 2000);
