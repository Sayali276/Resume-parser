$(document).ready(function() { 
    var urlParams = new URLSearchParams(window.location.search);
    var jdId = urlParams.get('jd')

    $('#closeModal').click(function() {
        location.href = '/applicant?jd=' + jdId;
    });

    $.get("getJob?jd=" + jdId, function( data ) {
        $('#jobTitle').html("Title: " + data["jobTitle"])
        $('#jobDesc').html(data["description"])
        window.localStorage.setItem('jobTokens',JSON.stringify(data["topTokens"]));
    });

    $('#btnApply').click(function() {
        var formData = new FormData();
        formData.append("applicantName", $('#applicantName').val());
        formData.append("applicantEmail", $('#applicantEmail').val());
        formData.append("applicantPhone", $('#applicantPhone').val());
        formData.append("jdId", jdId);
        formData.append("jobTokens", window.localStorage.getItem('jobTokens'));
        var file = document.getElementById("resume")
        formData.append('resume', file.files[0], file.files[0].name);
        
        $.ajax({
            type: "POST",
            url: "/applyJob",
            data: formData,
            processData: false,
            contentType: false,
            success: function(data, status, xhr) {
                console.log(status)
                $('#applicantId').html(data.applicantId);
                $('#appliedModal').modal('show');
            }
        });
    });
}); 