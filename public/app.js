$('#scrape-btn').on('click', function(e){

  $.ajax({
    type: "GET",
    url: "/scrape"
  }).done(function(data){

    $('#articles').empty();
    for (var i = 0; i < data.length; i++) {

      var subArr = data[i].subtitle;
      console.log(subArr);

      if (data[i].title){

        var articleItem = $('<div>').addClass('panel panel-default');
        var articleHeading = $('<h4>').addClass('panel-heading clearfix');
        var articleTitleLink = $('<a href="'+ data[i].link +'">'+ data[i].title +'</a>');
        articleHeading.append(articleTitleLink);
        var saveButton = $('<a>').attr('type', 'button').addClass('btn btn-success pull-right').attr('id', 'article-save').html('Save Article');
        articleHeading.append(saveButton);
        var articleSub = $('<div>').addClass('panel-body').text(subArr);

        articleItem.append(articleHeading);
        articleItem.append(articleSub);

        $('#articles').append(articleItem);
      }
    }
  });
  e.preventDefault();
});

$('document').on("click", "article-save", function() {

  

});