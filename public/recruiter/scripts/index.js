$(document).ready(function() { 
    $('#closeModal').click(function() {
        location.href = '/';
    });
    $('#btnPost').click(function() {
        var jobDesc = {
            "jobTitle": $('#jobTitle').val(),
            "description": $('#jd').val()
        };
        $.ajax({
            type: "POST",
            url: "/postJob",
            data: JSON.stringify(jobDesc),
            success: function(data, status, xhr) {
                console.log(status);
                $('#jdId').html(data.JobId);
                $('#jobLink').html("<a href='/applicant?jd=" + data.JobId + "'>this link</a>");
                $('#recruiterJobLink').html("<a href='/recruiter/applicants.html?jd=" + data.JobId + "'>this link</a>");
                $('#postedModal').modal('show');
            },
            contentType: "application/json"
          });
          
    });
}); 