$('#scrape-btn').on('click', function(e){

  $.ajax({
    type: "GET",
    url: "/scrape"
  }).done(function(data){

    $('#articles').empty();
    $('#helpy').fadeIn(1000);
    for (var i = 0; i < data.length; i++) {

      var subArr = data[i].subtitle;

      if (data[i].title){
        var formUp = $('div')
        var articleItem = $('<div>').addClass('panel panel-default').attr('id', i);
        var articleHeading = $('<h4>').addClass('panel-heading clearfix');
        var articleTitleLink = $('<a id="articleTitle" href="'+ data[i].link +'">'+ data[i].title +'</a>');
        articleHeading.append(articleTitleLink);
        var saveButton = $('<a>').attr('type', 'button').addClass('btn btn-success pull-right').attr('id', 'article-save').html('Save Article');
        articleHeading.append(saveButton);
        var articleSub = $('<div>').attr('id', 'articleSub').addClass('panel-body').text(subArr);
        articleItem.append(articleHeading);
        articleItem.append(articleSub);

        $('#articles').append(articleItem);
      }
    }
  });
  e.preventDefault();
});

$(document).on("click", "#article-save", function() {

  var arty = $(this).parent().parent();

  var articleObj = {
    title: arty.find("#articleTitle").text(),
    link: arty.find("#articleTitle").attr('href'),
    subtitle: arty.find("#articleSub").text()
  };

  $.ajax({
    method: "POST",
    url: "/new/article",
    data: articleObj
  })
    .done(function(data) {
      //do modal or alert "Article saved!"
      $('#saveModal').modal('show');
    });

});

$(document).on("click", "#add-note", function() {
  $("#artyModal").modal();
  //make modal with #save-note button. 
});



