const MARGIN = {
  left: 70,
  right: 30,
  top: 30,
  bottom: 70
};

const WIDTH = $("#chart-container").width() - MARGIN.left - MARGIN.right;
const HEIGHT = $("#chart-container").height() - MARGIN.top - MARGIN.bottom;

const t = d3.transition().duration(750);

const svg = d3.select("#chart-container").append("svg")
  .attr("width", WIDTH + MARGIN.left + MARGIN.right)
  .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom);

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

// our x scale spaces bar chart bands horizontally
// the domain is set in the update function and is an array of available inputs
const x = d3.scaleBand()
  .range([0, WIDTH])
  .paddingInner(0.1)
  .paddingOuter(0.1);

// our y scale determines the height of each bar
const y = d3.scaleLinear()
.range([HEIGHT, 0]);

const xAxis = d3.axisBottom(x);

const yAxis = d3.axisLeft(y);

const xAxisGroup = g.append("g")
.attr("transform", `translate(0, ${HEIGHT})`)
.attr("class", "x axis");

const yAxisGroup = g.append("g")
.attr("class", "y axis");

const xAxisLabel = g.append("text")
.attr("transform", `translate(${ WIDTH / 2 }, ${HEIGHT + MARGIN.bottom - 15})`)
.attr("class", "x axis-label")
.attr("text-anchor", "middle")
.style("font-family", "sans-serif")
.style("font-size", "12px")
.text("Year");

const yAxisLabel = g.append("text")
.attr("transform", "rotate(-90)")
.attr("class", "y axis-label")
.attr("text-anchor", "middle")
.attr("y", "-40")
.attr("x", -HEIGHT / 2)
.style("font-size", "12px")
.style("font-family", "sans-serif")
.text("Number of Books");

function update(data) {

  x.domain(data.map(d => d.year));
  y.domain([0, d3.max(data, d => d.numBooks)]);

  xAxisGroup.transition(t)
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 20)
    .attr("transform", "rotate(90)");

  yAxisGroup.transition(t).call(yAxis);

  // JOIN new data with old elements.
  const rectangles = g.selectAll("rect").data(data);

  // ENTER new elements present in the data onto the screen
  rectangles.enter().append("rect")
    .attr("fill", "#6dc0b0")
    .attr("y", y(0))
    .attr("height", 0)
    .merge(rectangles)
    .transition(t)
      .attr("year", d => d.year)
      .attr("x", d => x(d.year))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.numBooks))
      .attr("height", d => HEIGHT - y(d.numBooks));
}
