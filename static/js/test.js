<script>
    // Function to validate the task form
    function validateForm() {
        // Get values from input fields
        var task_title = document.getElementById("task_title").value; // Task title
        var task_detail = document.getElementById("task_detail").value; // Task detail (fixed the ID here)

        // Define regex patterns for validation
        var titleregex = /^[a-zA-Z_]{3,}$/; // Title must be at least 3 characters long (letters and underscores)
        var detailregex = /^.{30,}$/; // Details must be at least 30 characters long

        var isValid = true; // Initialize validity flag

        // Validate task title
        if (!titleregex.test(task_title)) {
            // Show error message if title is invalid
            document.getElementById("titleError").innerHTML = "Task should have at least three characters";
            isValid = false; // Mark as invalid
        } else {
            // Clear error message if title is valid
            document.getElementById("titleError").innerHTML = "";
        }

        // Validate task details
        if (!detailregex.test(task_detail)) {
            // Show error message if details are invalid
            document.getElementById("detailError").innerHTML = "Task details should have at least 30 characters";
            isValid = false; // Mark as invalid
        } else {
            // Clear error message if details are valid
            document.getElementById("detailError").innerHTML = "";
        }

        return isValid; // Return overall validity of the form
    }
</script>
