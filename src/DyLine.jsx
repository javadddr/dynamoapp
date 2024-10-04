import React, { useRef, useEffect, useState, useMemo } from 'react';

import * as d3 from 'd3';

import "./DyLine.css"





const DyLine = ({ data,dataPoints,chartBorder,linesPadding,colors,chartTemplate,legendTitle="BeeVans",lineAreaColor,areaColorOpacity, xAxisTitle = "Date", yAxisTitle = "Value",startFrom=0, chartTitle = "Chart Title" ,chartWidth=1000,chartHeight=500,lineShape="curveStep",  xAxis="date",
yAxis="values",
label='labels'}) => {
  
  
  



  
  




////

const [newData, setNewData] = useState([]);

useEffect(() => {
  const processData = () => {
    const dateMap = new Map();

    data.forEach((item) => {
      // Create a date in the local timezone at the start of the day
      const dateStr = item.date;
      const dateObj = new Date(dateStr);

      // Generate a date string from the Date object that matches the original date string
      const dateObjStr = dateObj.toISOString().split('T')[0];

      if (dateObjStr === dateStr) {
        if (!dateMap.has(dateStr)) {
          // If the date is not already in the map, add it with its values
          dateMap.set(dateStr, { ...item, date: dateObj }); // Store the Date object for sorting
        } else {
          // If the date exists, sum the values
          const existingItem = dateMap.get(dateStr);
          if (existingItem.values && Array.isArray(existingItem.values)) {
            existingItem.values = existingItem.values.map((val, index) => val + (item.values[index] || 0));
          }
        }
      } else {
        console.error('Invalid date format:', dateStr, 'parsed as', dateObjStr);
      }
    });

    // Convert the Map back to an array, sort by date, then map to remove the Date object
    const sortedArray = Array.from(dateMap.values())
      .sort((a, b) => a.date - b.date) // Sort by the Date object
      .map(item => {
        const { date, ...rest } = item; // Destructure to remove the Date object
        return {
          ...rest,
          date: date.toISOString().split('T')[0] // Convert back to string
        };
      });

    return sortedArray;
  };

  const combinedData = processData();
  setNewData(combinedData);

    // After setting newData, perform the transformation
    if (combinedData && combinedData.length > 0 && combinedData[0].labels && combinedData[0].values) {
      const parseDate = d3.timeParse("%Y-%m-%d");
      const transformed = combinedData[0].labels.map((label, i) => {
        return combinedData.map(d => ({
          date: parseDate(d.date),
          value: d.values[i],
          label: d.labels[i]
        }));
      });
      setTransformedData1(transformed);
    } else {
      console.error('combinedData is not in the expected format:', combinedData);
    }
}, [data]);


const [transformedData1, setTransformedData1] = useState([]);









  
  const svgRef = useRef();
  
  const [activeLabel, setActiveLabel] = useState(null); // null means all are active

  const legendSquareSize = 12;
  const legendSpacing = 2;
  const legendHeight = legendSquareSize + legendSpacing;
  const legendMargin = useMemo(() => ({ top: +30, right: 30 }), []);
  const curveTypes = useMemo(() => ({
    curveLinear: d3.curveLinear,
    curveStep: d3.curveStep,
    curveStepBefore: d3.curveStepBefore,
    curveStepAfter: d3.curveStepAfter,
    curveBasis: d3.curveBasis,
   
    curveMonotoneX: d3.curveMonotoneX,
    curveMonotoneY: d3.curveMonotoneY,
    
    curveNatural: d3.curveNatural,

  }), []);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set dimensions to the window's innerWidth and innerHeight
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  
    // Add event listener
    window.addEventListener('resize', handleResize);
  
    // Call handler right away so state gets updated with initial window size
    handleResize();
  
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount
  

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
    
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const margin = { top: 60, right: 140, bottom: 120, left: 120 };

    svg.selectAll("*").remove(); // Clear svg before adding new elements

    const parseDate = d3.timeParse("%Y-%m-%d");
 
    
   
   
 // Create scales
const xScale = d3.scalePoint()
    .domain(newData.map(d => parseDate(d.date)))
    .range([margin.left, width - margin.right])
    .padding(linesPadding); // Adjust padding to control the space around each point
 // Calculate maximum value from the dataset
 const maxValue = d3.max(transformedData1.flat(), d => d.value);

 // Increase the maximum value by 10%
 const upperBound = maxValue * 1.10;

    const yScale = d3.scaleLinear()
    .domain([0, upperBound])
      .range([height - margin.bottom, margin.top]);

      const yAxisGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(7)); // Use 5 ticks for the y-axis

// Create a unique list of dates for the x-axis


const dateFormatter = d3.timeFormat("%Y-%m-%d");

const xAxisGroup = svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(dateFormatter))


  .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)") // Adjust the rotation angle as needed
    .style("font-size", "12px")
    .style("font-family", "'Roboto', Arial, sans-serif") 
    .attr("fill", chartTemplate==="t1"?"black":chartTemplate==="t2"?"white":"black"); 

    xAxisGroup.selectAll(".tick text")
    .attr("transform", (d, i) => `translate(${i === 0 ? 30 : 0},0)`)
    ;


    xAxisGroup.selectAll(".tick text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px")
    .style("font-family", "'Roboto', Arial, sans-serif") 
    ;


// Append x-axis title
    svg.append("text")
      .attr("class", "axis-title")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 100) // Adjust this to fit below the rotated tick labels
      .style("font-size", "15px")
      .attr("text-anchor", "middle")
      .style("font-family", "'inter', Arial, sans-serif") 
      .attr("fill", chartTemplate==="t1"?"black":chartTemplate==="t2"?"#94A3B8":"white")
      .text(xAxisTitle);


// ... the rest of your code

// Add Y axis with a specified number of ticks

yAxisGroup.selectAll(".tick text")
  .style("font-size", "13px")
  .attr("x", -20)
  .attr("fill", chartTemplate==="t1"?"black":chartTemplate==="t2"?"white":"black"); // Set the font size for y-axis labels
// Add Y axis title
yAxisGroup.append("text")
  .attr("class", "axis-title")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 60) // Adjust if necessary
  .attr("x", -height / 2)
  .style("font-size", "15px")
  .attr("text-anchor", "middle")
  .style("font-family", "'Roboto', Arial, sans-serif") 
  .attr("fill", chartTemplate==="t1"?"black":chartTemplate==="t2"?"#94A3B8":"white")
  .text(yAxisTitle);


    // Define the area generator
   // Apply offset to the first point of each area series
   const area = d3.area()
   .defined(d => d.value != null)
   .x(d => xScale(d.date)) // Use xScale for positioning
   .y0(height - margin.bottom)
   .y1(d => yScale(d.value))
   .curve(curveTypes[lineShape] || d3.curveMonotoneX);

    // Line generator with curve
   // Apply offset to the first point of each line series
   const line = d3.line()
   .defined(d => d.value != null)
   .x(d => xScale(d.date)) // Use xScale for positioning
   .y(d => yScale(d.value))
   .curve(curveTypes[lineShape] || d3.curveMonotoneX);




   // Add legend title
    svg.append('text')
      .attr('x',width - margin.right + legendMargin.right+40)
      .attr('y', legendMargin.top)
      .attr('text-anchor', 'end')

      .attr("fill", chartTemplate==="t1"?"black":chartTemplate==="t2"?"#94A3B8":"black")
      .style("font-family", "'font-sans', Arial, sans-serif") 
      .text(legendTitle);

    // Draw legend
    const legend = svg.selectAll('.legend')
    .data(data[0].labels)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(${width - margin.right + legendMargin.right}, ${legendMargin.top + i * legendHeight + legendSquareSize})`)
    .style("font-family", "'font-sans', Arial, sans-serif") 
    .style('cursor', 'pointer')
    .style("font-size", "13px")
   
    .on('click', (event, label) => {
      setActiveLabel(activeLabel === label ? null : label); // Toggle active label
    });

    // Draw legend colored squares
    legend.append('rect')
      .attr('width', legendSquareSize)
      .attr('height', legendSquareSize)
      .attr('fill', (d, i) => activeLabel && d !== activeLabel ? '#ccc' : colors[i % colors.length]);

    
    legend.append('text')
      .attr('x', legendSquareSize + legendSpacing)
      .attr('y', legendSquareSize - legendSpacing)
      .text(d => d)
      .attr('fill', (d) => activeLabel && d !== activeLabel ? '#ccc' : chartTemplate==="t1"?"black":chartTemplate==="t2"?"rgb(216, 221, 43)":"white");

      svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2) 
        .attr("y", margin.bottom / 2 -30)
        .attr("text-anchor", "middle")
        .attr("fill",chartTemplate==="t1"?"black":chartTemplate==="t2"?"#94A3B8":"white")
        .style("font-size", "17px")
        .style("font-family", "'font-sans', Arial, sans-serif") 
        .text(chartTitle);


 
    transformedData1.forEach((series, idx) => {
      const color = colors[idx % colors.length];
      const isInactive = activeLabel !== null && series[0].label !== activeLabel;
  
      svg.append("path")
        .datum(series)
        .attr("fill", color)
        .attr("opacity", isInactive ? 0 : lineAreaColor?areaColorOpacity:0)
        .attr("d", area);

      
      const path = svg.append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("opacity", isInactive ? 0 : 1);

      // Animate the line
      const totalLength = path.node().getTotalLength();
      path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

 
      svg.selectAll(".point")
      .data(series)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => xScale(d.date) + (i === 0 ? startFrom : 0)) // Shift only the first circle
      .attr("cy", height - margin.bottom) 
      .attr("r", dataPoints)
      .attr("fill", color)
      .transition() 
      .duration(1500)
      .attr("cy", d => yScale(d.value))
      .attr("opacity", isInactive ? 0 : 1);
  


svg.selectAll(".text")
.data(series)
.enter()
.append("text")
.attr("x", (d, i) => xScale(d.date) + (i === 0 ? startFrom : 0)) // Shift only the first label
.attr("y", height - margin.bottom) 
.attr("dy", "-0.5em")
.attr("text-anchor", "middle")
.text(d => d.value)
.attr("font-size", "12px")
.attr("fill", color)
.style("font-family", "'font-sans', Arial, sans-serif") 
.transition() 
.duration(1500)
.attr("y", d => yScale(d.value))
.attr("opacity", isInactive ? 0 : 1);



    });
    const invisibleLineWidth = 110; 
    
const invisibleLines = svg.selectAll(".invisible-line")
.data(newData)
.enter()
.append("rect")
.attr("class", "invisible-line")
.attr("x", d => xScale(parseDate(d.date)) - (invisibleLineWidth / 2))
.attr("y", margin.top)
.attr("width", invisibleLineWidth)
.attr("height", height - margin.top - margin.bottom)
.style("opacity", 0);

invisibleLines.on("mouseover", function (event, d) {

d3.select(this).style("opacity", 0.2);


let tooltipContent = `Date: ${d.date}<br><br>`;
d.values.forEach((val, index) => {
  tooltipContent += `${data[0].labels[index]}: ${val}<br>`;
});


d3.select('#tooltipidk')
  .style('display', 'block')
  .html(tooltipContent)
  .style('left', (event.pageX + 15) + 'px') 
    .style('top', (event.pageY ) + 'px'); 
})
.on("mousemove", function(event) {
 
  d3.select('#tooltipidk')
    .style('left', (event.pageX +20) + 'px')
    .style('top', (event.pageY) + 'px');
})
.on("mouseout", function () {

d3.select(this).style("opacity", 0);
d3.select('#tooltipidk').style('display', 'none');
});


  }, [data, colors,activeLabel, xAxisTitle, yAxisTitle, chartTitle,dimensions,startFrom,curveTypes,newData,legendHeight,legendMargin,legendTitle,lineShape,transformedData1,lineAreaColor,areaColorOpacity,linesPadding,chartTemplate,dataPoints]);

  return (
    <div className='shadow-4xl rounded-md' style={{ width:dimensions.width>chartWidth?chartWidth:dimensions.width, height :dimensions.height>chartHeight?chartHeight:dimensions.height,border:chartBorder?"1px solid black":"none" ,padding:"10px",margin:"10px",backgroundColor:chartTemplate==="t1"?"white":chartTemplate==="t2"?"#020917":"white"}}>
      <svg ref={svgRef} className="mySvgStylet" style={{backgroundColor:chartTemplate==="t1"?"white":chartTemplate==="t2"?"#020917":"white"}}></svg>
      <div 
          id="tooltipidk" 
          className="tooltip-linopd" 
          style={{ 
              position: 'absolute',
              left: '50px', // Example position
              top: '50px', // Example position
              display: 'none', // Initially hidden, change to 'flex' for testing
              justifyContent: 'flex-start',
              padding: '8px',
              background: `${chartTemplate==="t1"?"white":chartTemplate==="t2"?"#020917":"white"}`,
             border:'1px solid gray',
              borderRadius: '4px',
              pointerEvents: 'none', // Don't block mouse events
              zIndex: 1000,
              color:  `${chartTemplate==="t1"?"black":chartTemplate==="t2"?"white":"white"}`,
              fontSize: '12px',
              fontFamily: "'font-sans', Arial, sans-serif",
          }}
      ></div>

    </div>
  );
  
};

export default DyLine;
