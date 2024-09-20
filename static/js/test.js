    <script>
        function validateForm() {

            var task_title = document.getElementById("task_title").value;
            var task_detail = document.getElementById("task_title").value;

            var titleregex = /^[a-zA-Z_]{3,}$/;
            var detailregex = /^.{30,}$/;


            var isValid = true;


            if (!titleregex.test(task_title)) {
                document.getElementById("titleError").innerHTML = "Task should have atleast Three character";
                isValid = false;
            } else {
                document.getElementById("titleError").innerHTML = "";
            }
            if (!detailregex.test(task_detail)) {
                document.getElementById("detailError").innerHTML = "Task Details should have atleast 30 character";
                isValid = false;
            } else {
                document.getElementById("detailError").innerHTML = "";
            }
            return isValid;
            }
    </script>