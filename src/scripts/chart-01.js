import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'

d3.tip = d3Tip

const margin = { top: 100, left: 100, right: 80, bottom: 50 }
const height = 700 - margin.top - margin.bottom
const width = 750 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const xPositionScale = d3
  .scaleLinear()
  .domain([0, 18])
  .range([0, width])

const yPositionScale = d3
  .scalePoint()
  .range([height, 0])
  .padding(0.5)

const tipMen = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return `${d.values[0].male}`
  })

svg.call(tipMen)

const tipWomen = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return `${d.values[0].female}`
  })

svg.call(tipWomen)

d3.csv(require('../data/uninsured_adults.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  console.log('Data read in:', datapoints)
  const nested = d3
    .nest()
    .key(function(d) {
      return d.state
    })
    .entries(datapoints)

  console.log('Nested data read in:', nested)

  const names = nested.map(d => d.key)
  yPositionScale.domain(names)

  svg
    .selectAll('g')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return `translate(0,${yPositionScale(d.key)})`
    })
    .each(function(d) {
      const g = d3.select(this)
      const name = d.key
      const datapoints = d.values
      const femaleMins = datapoints[0].female
      const maleMins = datapoints[0].male


      g.append('line')
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('x1', xPositionScale(femaleMins))
        .attr('x2', xPositionScale(maleMins))
        .attr('stroke', 'black')

      g.append('circle')
        .attr('r', 4)
        .attr('fill', '#fde725')
        .attr('cy', 0)
        .attr('cx', xPositionScale(femaleMins))
        .on('mouseover', tipWomen.show)
        .on('mouseout', tipWomen.hide)

      g.append('circle')
        .attr('r', 4)
        .attr('fill', '#31688e')
        .attr('cy', 0)
        .attr('cx', xPositionScale(maleMins))
        .on('mouseover', tipMen.show)
        .on('mouseout', tipMen.hide)
    })

  const annotations = [
    {
      note: {
        label:
          '',
        wrap: 90
      },
      // connector: {
      //   end: "arrow",        // none, or arrow or dot         // Number of break in the curve
      //   lineType : "horizontal"
      // },
      // x: 603,
      // y: 130,
      // dy: 40,
      // dx: 20
    },
    {
      note: {
        label: '',
        wrap: 80
      },
      // connector: {
      //   end: "arrow",        // none, or arrow or dot         // Number of break in the curve
      //   lineType : "horizontal"
      // },
      // x: 158,
      // y: 573,
      // dy: -20,
      // dx: 0
    }
  ]

  const makeAnnotations = d3Annotation.annotation().annotations(annotations)

  d3.select('svg')
    .append('g')
    .style('font-size', '10px')
    .call(makeAnnotations)

  const xAxis = d3.axisBottom(xPositionScale).tickSize(-height)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  svg
    .append('g')
    .attr('class', 'axis x-axis-2')
    .attr('transform', 'translate(0, -15)')
    .call(xAxis)

  svg
    .selectAll('.x-axis line')
    .attr('stroke-dasharray', '1 6')
    .attr('fill', 'lightgrey')

  svg.selectAll('.x-axis path').remove()

  svg.select('.x-axis').lower()

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .attr('font-size', '10')

  svg.selectAll('.y-axis path, .y-axis line').remove()
  svg.selectAll('.x-axis-2 path, .x-axis-2 line').remove()

  svg
    .append('text')
    .attr('font-size', '18')
    .attr('text-anchor', 'middle')
    .text('The gender gap of uninsured Americans by state')
    .attr('x', width / 2)
    .attr('y', -70)
    .attr('dx', -40)
    .attr('font-weight', 'bold')

    svg
    .append('text')
    .attr('font-size', '14')
    .attr('text-anchor', 'right')
    .text('The percentage of men uninsured is higher than women in every state, a 2012-2016 survey shows.')
    .attr('x', 0)
    .attr('y', -40)
    .attr('dx', -10)
}
