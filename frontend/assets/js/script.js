function teacherLogin() {
    const email = document.getElementById("teacherEmail").value;
    const pass = document.getElementById("teacherPass").value;

    if (email === "teacher@school.com" && pass === "1234") {
        alert("Teacher Login Successful");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid Teacher Credentials");
    }
}

function staffLogin() {
    const email = document.getElementById("staffEmail").value;
    const pass = document.getElementById("staffPass").value;

    if (email === "staff@school.com" && pass === "1234") {
        alert("Staff Login Successful");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid Staff Credentials");
    }
}

function goToAttendance() {
    window.location.href = "attendance.html";
}

function logout() {
    alert("Logged Out Successfully");
    window.location.href = "index.html";
}

function submitAttendance() {
    alert("Attendance Submitted Successfully");
}
