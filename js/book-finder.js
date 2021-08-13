let limit = 1;
let books = [];

function getSearchTerms() {
  let phraseField = document.querySelector(".phrase-field");
  let phrase = phraseField.value.trim();
  return phrase;
}

function findBooks() {
  books = [];
  limit = 1; // reset to 20 on new search
  let searchTerms = getSearchTerms();
  $("rect").remove();
  queryOpenLibrary(searchTerms);

  return false; // stops redirect
}

function queryOpenLibrary(queryStr) {
  let terms = queryStr.replace(/\s+/g, "+"); // replace whitespace with + for api call
  let url = `//openlibrary.org/search/inside.json?q=${terms}&page=${limit}`;

  $.getJSON(url).done(function(data){

    if (data) {
      data.hits.hits.forEach(function(book) {

        if (book.fields.meta_year) {
          let bookClean = new Object({"year": Number(book.fields.meta_year[0])});

          bookClean.decade = bookClean.year - bookClean.year % 10;
          
          if (book.edition) {
            bookClean.url = '//openlibrary.org/' + book.edition.url;
            bookClean.cover_url = book.edition.cover_url;
          }

          books.push(bookClean);
       }
      });

      triggerD3Update();
      $("#results-container > button").show();
      $("#results").html(`Displaying ${books.length} of ${data.hits.total} for phrase \"${queryStr}\"`);
    }
  }).fail(function() {
    console.log("Getting data failed.")
  });
}

function fetchMore() {
  let searchTerms = getSearchTerms();
  limit += 1;
  queryOpenLibrary(searchTerms);
}

function displayBooks(booksSubset) {
  let tr = $("tr:last").html("").get();

  booksSubset.forEach(function(book) {
    let cover_url = book.cover_url;
    let openLibraryUrl = book.url || "#";
    
    let td = $("<td>");

    if (cover_url !== undefined) {
      let img = $("<img>").attr("src", cover_url);
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
    let freq = yearMap.has(b.decade) ? yearMap.get(b.decade) : 0;
    yearMap.set(b.decade, ++freq);
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
      let decade = Number($(this).attr("year"));
      return (book.year - book.year % 10) === decade;
    });

    displayBooks(subset);
  });
}