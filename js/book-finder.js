let page = 1;
let books = [];

function init() {
  page = 1;
  books = [];
  $("rect").remove();
  $("#books-container").html("");
  $("#results-container > button").hide();
  $("#results").html("");
}

function getSearchTerms() {
  let phraseField = document.querySelector(".phrase-field");
  let phrase = phraseField.value.trim();
  return phrase;
}

function findBooks() {
  init();

  let searchTerms = getSearchTerms();
  queryOpenLibrary(searchTerms);

  return false; // stops redirect
}

function queryOpenLibrary(queryStr) {
  let terms = queryStr.replace(/\s+/g, "+"); // replace whitespace with + for api call
  let url = `//openlibrary.org/search/inside.json?q=${terms}&page=${page}`;

  $.getJSON(url).done(function(data){

    if (data.hits.hits.length !== 0) {

      data.hits.hits.forEach(function(book) {

        if (book.fields.meta_year) {
          let bookClean = new Object();

          bookClean.year = Number(book.fields.meta_year[0]);
          bookClean.decade = bookClean.year - bookClean.year % 20;
          
          if (book.edition) {
            bookClean.url = '//openlibrary.org/' + book.edition.url;
            bookClean.cover_url = book.edition.cover_url;
          }

          books.push(bookClean);
       }
      });

      triggerD3Update();
      $("#results-container > button").show();
      $("#results").html(`Retrieved ${20 * page} out of ${data.hits.total} results for phrase \"${queryStr}\"`);
    } else {
      $("#results").html(`Retrieved 0 results for phrase \"${queryStr}\"`);
    }
  }).fail(function() {
    console.log("Getting data failed.")
  });
}

function fetchMore() {
  let searchTerms = getSearchTerms();
  page += 1;
  queryOpenLibrary(searchTerms);
}

function displayBooks(booksSubset) {
  let div = $("#books-container").html("").get();

  booksSubset.forEach(function(book) {
    let cover_url = book.cover_url;
    let openLibraryUrl = book.url || "#";

    if (cover_url !== undefined) {
      let img = $("<img>").attr("src", cover_url);
      $(img).click(function() {
        window.open(openLibraryUrl, "_blank");
      });
      $(div).append($(img));
    } else {
      let text = $("<p>").html("[?]");
      $(text).click(function() {
        window.open(openLibraryUrl, "_blank");
      });
      $(div).append(text);
    }
  });
}

function triggerD3Update() {
  // Map each decade to the number of book results
  let decadeMap = new Map();

  books.forEach(function(b) {
    let freq = decadeMap.has(b.decade) ? decadeMap.get(b.decade) : 0;
    decadeMap.set(b.decade, ++freq);
  });

  let mapItr = decadeMap[Symbol.iterator]();

  // Translate map into array of objects to pass to D3
  let cleanData = []

  for (const item of mapItr) {
    let decade = Number(item[0]);
    let numBooks = Number(item[1]);
    let book = new Object();
    book.year = decade;
    book.numBooks = numBooks;
    cleanData.push(book);
  }

  // Sort the array by year 
  cleanData.sort(function(a, b) {
    return a.year - b.year;
  });

  // update D3 and show chart
  update(cleanData);
  $("#chart-container").css("visibility", "visible");

  // assign event listener to every charted rectangle
  $("rect").hover(function() {
    let subset = books.filter((book) => {
      let decade = Number($(this).attr("year"));
      return (book.year - book.year % 20) === decade;
    });

    displayBooks(subset);
  });
}