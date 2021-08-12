let limit = 20;
let books = [];

function getSearchTerms() {
  let phraseField = document.querySelector(".phrase-field");
  let phrase = phraseField.value.trim();
  return phrase;
}

function findBooks() {
  limit = 20; // reset to 20 on new search
  let searchTerms = getSearchTerms();
  $("rect").remove();
  queryOpenLibrary(searchTerms);

  return false; // stops redirect
}

function queryOpenLibrary(queryStr) {
  let terms = queryStr.replace(/\s+/g, "+"); // replace whitespace with + for api call
  let url = `//openlibrary.org/search.json?q=${terms}&limit=${limit}`;

  $.getJSON(url).done(function(data){
    if (data) {
      books = data.docs;
      let numBooks = data.numFound;
      triggerD3Update();
      $("#results-container > button").show();
      $("#results").html(`Displaying ${books.length} of ${numBooks} for phrase \"${queryStr}\"`);
    }
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

function triggerD3Update() {
  let yearMap = new Map();

  books.forEach(function(b) {
    if (b.first_publish_year) {
      let freq = yearMap.has(b.first_publish_year) ? yearMap.get(b.first_publish_year) : 0;
      yearMap.set(b.first_publish_year, ++freq);
    }
  });

  let mapItr = yearMap[Symbol.iterator]();

  let cleanData = []

  for (const item of mapItr) {
    let year = Number(item[0]);
    let numBooks = Number(item[1]);
    let book = new Object();
    book.year = year;
    book.numBooks = numBooks;
    cleanData.push(book);
  }

  cleanData.sort(function(a, b) {
    return a.year - b.year;
  });

  update(cleanData);
  $("#chart-container").css("visibility", "visible");

  $("rect").hover(function() {
    let subset = books.filter((book) => {
      return book.first_publish_year === Number($(this).attr("year"));
    });

    displayBooks(subset);
  });
}