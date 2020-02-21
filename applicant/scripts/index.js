$(document).ready(function() { 
    var urlParams = new URLSearchParams(window.location.search);
    var jdId = urlParams.get('jd')

    $.get("getJob?jd=" + jdId, function( data ) {
        $('#jobTitle').html("Title: " + data["jobTitle"])
        $('#jobDesc').html(data["description"])
    });

    $('#btnApply').click(function() {
        var formData = new FormData();
        formData.append("applicantName", $('#applicantName').val());
        formData.append("applicantEmail", $('#applicantEmail').val());
        formData.append("applicantPhone", $('#applicantPhone').val());
        formData.append("jdId", jdId);
        var file = document.getElementById("resume")
        formData.append('resume', file.files[0], file.files[0].name);
        
        $.ajax({
            type: "POST",
            url: "/applyJob",
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                console.log("POST SUCESS")
                location.href = 'applied.html';
            }
        });
    });
}); 