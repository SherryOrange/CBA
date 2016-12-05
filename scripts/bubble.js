(function() {

// Bubble Chart
d3.bubble = function() {
  var width = 380,
      height = 600,
      columnWidth = 300,
      columnMargin = 90,
      duration = 0;

  // Inject external function
  var gapY = bubbleGapY,
      dotCor = bubbleDotCor,
      lineCor = bubbleLineCor;

  // Configurations for bubble chart
  var globalMoveStep = 800, // Bubble shift step
      trivialMoveStep = 80, // Trend line dot shift step
      trendlineStepCount = 6; // Trend line dot count

  // For each small multiple…
  function bubble(g) {
    g.each(function(d, i) {
      
      var middleX = columnWidth / 2,
          middleY = height / 2;
      var g = d3.select(this);

      // Compute the new transition.
      var currentMeasure = d.record[d.record.length-1].measure;
      var gap1 = gapY.call(this, d, currentMeasure);
      var globalShift = - gap1 * globalMoveStep;
      //console.log('gap1 = '+gap1);

      // Circle
      var circleR = middleX - columnMargin;
      var bubbleCircle = g.selectAll('circle.border')
          .data([gap1]);
      bubbleCircle.enter().append('circle')
          .attr('class', 'border')
          .attr('r', circleR)
          .attr('cx', middleX)
          .attr('cy', middleY);
      g.selectAll('circle.border')
        .transition()
          .duration(duration)
          .style('stroke', function(d){console.log(d); return ((d>0)?'#FFA78F':'#B2F0BB'); });


      // Current record
      var bubbleCurrentRecordShift = -20;
      var bubbleCurrentRecord = g.selectAll('text.jumbo')
          .data([currentMeasure]);
      bubbleCurrentRecord.enter().append('text')
          .attr('class', 'jumbo')
          .attr('width', width)
          .attr('height', 30)
          .attr('text-anchor', 'middle')
          .attr('x', middleX)
          .attr('y', middleY + bubbleCurrentRecordShift)
          .text(function(d){ return d.toFixed(2) + 's'; });


      // Compare record
      var bubbleCompareRecordShift = (circleR + 20);
      var bubbleCompareRecord = g.selectAll('text.compare')
          .data([gap1]);
      bubbleCompareRecord.enter().append('text')
          .attr('class', 'compare')
          .attr('text-anchor', 'middle')
          .attr('x', columnWidth/2)
          .attr('y', middleY + bubbleCompareRecordShift);
      g.selectAll('text.compare')
          .text(function(d){console.log('new d ='+d); return ((d>0)?'+':'') + d + 's'; });


      // Name
      var bubbleNameShift = - bubbleCompareRecordShift;
      var bubbleName = g.selectAll('text.name')
          .data([d.name]);
      bubbleName.enter().append('text')
          .attr('class', 'name')
          .attr('width', width)
          .attr('height', 30)
          .attr('text-anchor', 'middle')
          .attr('x', middleX)
          .attr('y', middleY + bubbleNameShift)
          .text(function(d){ return d; });


      // Mini Line Chart
      // Dots
      var dotR = 2,
          circlePadding = 40,
          dotStepX = (circleR - circlePadding) / (trendlineStepCount - 1) * 2;
      var dotCors = dotCor.call(this, d, trendlineStepCount, middleX, circleR-circlePadding, dotStepX, trivialMoveStep);
      var bubbleDots = g.selectAll('circle.dot')
          .data(dotCors);
      bubbleDots.enter().append('circle')
          .attr('class', 'dot')
          .attr('r', dotR)
          .attr('cx', function(d){ return d[0]; })
          .attr('cy', function(d){ return middleY + d[1]; });
      // Lines
      var lineCors = lineCor.call(this, dotCors);
      var bubbleLines = g.selectAll('path.line')
          .data(lineCors);
      bubbleLines.enter().append('path')
          .attr('class', 'line')
          .attr('d', function(d){
              return 'M ' + d.from[0] + ' ' + (middleY+d.from[1]) + ' L ' + d.to[0] + ' ' + (middleY+d.to[1]);
          });


      // Transite whole bubble position
      g.transition()
          .duration(duration)
          .attr('transform', 'translate(0,' + globalShift + ')');

    });
    d3.timerFlush();
  }

  // API open for external use to set bubble chart configuration
  bubble.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bubble;
  };
  bubble.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bubble;
  };
  bubble.columnWidth = function(x) {
    if (!arguments.length) return height;
    columnWidth = x;
    return bubble;
  };
  bubble.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return bubble;
  };

  return bubble;
};

// Extract chart
function makeHistoryArray(d, stepCount){
    var hisArray = [];
    var j = (d.record.length - stepCount > 0) ? d.record.length - stepCount : 0;

    for(var i = d.record.length-1; i>=j; i--){
      hisArray.splice(0, 0, d.record[i].measure);
    }

    return hisArray;
}
// Calculate dot cordinate for trend line
function bubbleDotCor(d, stepCount, middleX, shiftLeft, dotStepX, trivialMoveStep) {
    var cor = [];
    var hisArray = makeHistoryArray(d, stepCount);
    var hisMeasureMin = d3.min(hisArray);

    for(var i in hisArray){
      cor.push([middleX - shiftLeft + i * dotStepX, 30 + (hisMeasureMin - hisArray[i]) * trivialMoveStep]);
    }
    return cor;
}
// Put dot cordinates into grouped array to draw line
function bubbleLineCor(dotCors){
    var cor = [];
    for(var i=0, l=dotCors.length-1; i<l; i++){
      cor.push({ from: dotCors[i], to:dotCors[i+1] });
    }
    return cor;
}
// Calculate transition for current selection
function bubbleGapY(d, currentMeasure){
    var index = -1;
    for(var i in d.record){
      if(d.record[i].year == d.compareKey){
        index = i;
        break;
      }
    }

    if(index !== -1){
      return Math.round( (currentMeasure - d.record[index].measure || 0) * 100 ) / 100;
    }
    return 0;
}

})();