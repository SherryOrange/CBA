var margin = {top: 0, right: 80, bottom: 20, left: 40},
    windowWidth = 800,
    windowHeight = 700,
    width = windowWidth - margin.left - margin.right,
    height = windowHeight - margin.top - margin.bottom;

// Data will load from data.json, if failing, using this
var backupData = [{name:"Usain Bolt",record:[{year:"2010",measure:9.82},{year:"2011",measure:9.76},{year:"2012",measure:9.63},{year:"2013",measure:9.77},{year:"2014",measure:9.98},{year:"2015",measure:9.79},{year:"2016",measure:9.81}],compareKey:"2015"},{name:"Justin Gatlin",record:[{year:"2010",measure:10.09},{year:"2011",measure:9.95},{year:"2012",measure:9.79},{year:"2013",measure:9.85},{year:"2014",measure:9.77},{year:"2015",measure:9.74},{year:"2016",measure:9.8}],compareKey:"2015"}];

var chart = d3.bubble()
    .width(width)
    .height(height);

  // Base line and wording
  var baseMarginLeft = 10;
  var baseline = d3.select('.baseline').selectAll('svg')
          .data([1])
      .enter().append('svg')
          .attr('width', windowWidth)
          .attr('height', windowHeight)

  var line = baseline.append('g')
  .attr('transform', 'translate(0, ' + height / 2 + ')');
      
    line.append('path')
        .attr('class', 'line')
        .attr('d', 'M ' + baseMarginLeft + ' 1 L ' + windowWidth + ' 1')
        .attr('stroke-dasharray', '5,5');
    
    line.append('text')
        .attr('class', 'wording')
        .text('0s')
        .attr('x', baseMarginLeft)
        .attr('y', 20);

    line.append('text')
        .attr('class', 'wording')
        .text('diff')
        .attr('x', baseMarginLeft)
        .attr('y', 35);
    // END Base line and wording


// Load data & draw
d3.json('./scripts/data.json', function(error, data) {
  // Data loaded failing, use backup
  if (error){
    data = backupData;
  }

    var columnWidth = width / data.length;
    chart.columnWidth(columnWidth)
        .duration(1000);

    // Draw bubble
    var svg = d3.select('.chart-container').selectAll('svg')
        .data(data)
      .enter().append('svg')
        .attr('class', 'bubble')
        .attr('width', columnWidth)
        .attr('height', height)
      .append('g')
        .call(chart);

    // Change selection, update chart
    d3.selectAll('.dropdown li').on('click', function() {
      // Set look for dropdown selected item
      d3.selectAll('.dropdown li').attr('class', '');
      var selectedLi = d3.select(this).attr('class', 'selected');
      // Read selection
      var newValue = selectedLi.attr('value');
      var newText = selectedLi.html();

      // Set new text for dropdown button and update bubble chart
      d3.select('#currentSelection').html(newText);
      svg.datum(function(d){
          d.compareKey = newValue;
          return d;
      }).call(chart.duration(1000)); 
    });
  
});
