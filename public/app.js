$('#scrape-btn').on('click', function(e){

  $.ajax({
    type: "GET",
    url: "/scrape"
  }).done(function(data){

    console.log(data[0].title, data[0].subtitle);

    $('#articles').empty();
    for (var i = 0; i < data.length; i++) {

      var articleItem = $('<div>').addClass('panel panel-default');
      var articleTitle = $('<h4>').addClass('panel-heading clearfix').text(data[i].title);
      var saveButton = $('<a>').attr('type', 'button').addClass('btn btn-success pull-right').attr('id', 'article-save').html('Save Article');
      articleTitle.append(saveButton);
      var articleSub = $('<div>').addClass('panel-body').text(data[i].subtitle);

      articleItem.append(articleTitle);
      articleItem.append(articleSub);

      $('#articles').append(articleItem);
    }
  });
  e.preventDefault();
});
