let limit = 20;
let books = [];
let numBooks = 0;

function getSearchTerms() {
  let phraseField = document.querySelector(".phrase-field");
  let phrase = phraseField.value.trim();
  return phrase;
}

function findBooks() {
  limit = 20; // reset to 20 on new search
  let searchTerms = getSearchTerms();
  queryOpenLibrary(searchTerms);

  return false; // stops redirect
}

function queryOpenLibrary(queryStr) {
  let terms = queryStr.replace(/\s+/g, "+"); // replace whitespace with + for api call
  let url = `http://openlibrary.org/search.json?q=${terms}&limit=${limit}`;

  $.getJSON(url).done(function(data){
    if (data) {
      books = data.docs;
      numBooks = data.numFound;
    }

    $("#results-container > button").show();
    $("#results").html(`Displaying ${books.length} of ${numBooks} for phrase \"${queryStr}\"`);
  }).fail(function() {
    console.log("Getting data failed.")
  });
}

function fetchMore() {
  let searchTerms = getSearchTerms();
  limit += 20;
  queryOpenLibrary(searchTerms);
}

function displayBooks(booksSubset) {
  let tr = $("tr:last").html("").get();
  let cover_url = "//covers.openlibrary.org/b/id/";  

  booksSubset.forEach(function(book) {
    let coverIndex = book.cover_i;
    let openLibraryUrl = "//openlibrary.org/" + book.key;
    
    let td = $("<td>");

    if (coverIndex !== undefined) {
      let img = $("<img>").attr("src", cover_url + coverIndex + ".jpg");
      $(img).click(function() {
        window.open(openLibraryUrl, "_blank");
      });
      $(td).append($(img));
    } else {
      let text = $("<p>").html("[?]");
      $(text).click(function() {
        window.open(openLibraryUrl, "_blank");
      });
      $(td).append(text);
    }

    $(tr).append($(td));
  });
}