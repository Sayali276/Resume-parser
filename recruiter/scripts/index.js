$(document).ready(function() { 
    $('#btnPost').click(function() {
        var jobDesc = {
            "jobTitle": $('#jobTitle').val(),
            "description": $('#jd').val()
        };
        $.ajax({
            type: "POST",
            url: "/postJob",
            data: JSON.stringify(jobDesc),
            success: function() {
                console.log("POST SUCESS")
            },
            contentType: "application/json"
          });
          
    });
}); 