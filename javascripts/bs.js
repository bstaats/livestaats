if(bs === undefined) var bs = {};

bs.render = function(days){
  d3.json('data?days='+days, function(json){
    if(json){
      var ticks,secFilter,format,
          interval  = json.interval.map(function(d){return new Date(d)}),
          vis       = $('#vis'+days),
          scale     = pv.Scale.linear().domain(interval).range(0,vis.width()-1);  // -1 so last tick mark is seen

      if(days>6){
        format    = pv.Format.date("%d %b");
        ticks     = d3.range(0,days,2).map(function(d){var date = newDate(0); date.setDate(date.getDate()+d);return date;});
        secFilter = 1200;
        ticks.push(newDate(1));
      }else if(days>0){
        format    = pv.Format.date("%a %d %b");
        ticks     = d3.range(0,days).map(function(d){var date = newDate(0); date.setDate(date.getDate()+d);return date;});
        secFilter = 600;
        ticks.push(newDate(1));
      }else{
        interval[1].setHours(interval[1].getHours()+1);
        scale.domain(interval);
        format    = pv.Format.date("%I");
        ticks     = d3.range(0,25,2).map(function(d){var date = newDate(0); date.setHours(d);return date;});
        secFilter = 300;
      }

      var arcs = new bs.Arc({
          el:         vis,
          json:       json.data.rows,
          interval:   interval,
          ticks:      ticks,
          scale:      scale,
          format:     format,
          secFilter:  secFilter
        });

      var svg = d3.select('#vis'+days+' svg');
      if(!svg.empty()){
        $('#vis'+days).height(svg.property('clientHeight'));
        $('#vis'+days).append($('#templates .description').clone());

        if(days>6){
          //$('#vis'+days+' .info .value').html(pv.Format.date('%b %d %Y')(new Date()));
          //$('#vis'+days+' .info .label').html('Thirty days');
          $('#vis'+days+' .description .title').html("Last thirty days of Work Patterns")
        }else if(days>0){
          //$('#vis'+days+' .info .value').html(pv.Format.date('%b %d %Y')(new Date()));
          //$('#vis'+days+' .info .label').html('Seven days');
          $('#vis'+days+' .description .title').html("Last seven days of Work Patterns")
        }else{
          $('#vis'+days+' .info .value').html(pv.Format.date('%b %d %Y')(new Date()));
          $('#vis'+days+' .info .label').html('Today');
          $('#vis'+days+' .description .title').html("Today&#8217s Work Patterns")
        }

        $('#vis'+days+' .total .value').html(arcs.getTime())

      }else{
        error(days);
      }

    }else{
      error(days);
    }
    $('#vis'+days+' img').remove();

    function newDate(i){
      return new Date(interval[i].getFullYear(),interval[i].getMonth(),interval[i].getDate());
    }

    function error(days){
      $('#vis'+days).prepend($('#templates .myerror').clone());
      if(days>6){
        $('#vis'+days+' .why').html('No data for the month')
      }else if(days>0){
        $('#vis'+days+' .why').html('No data for week')
      }else{
        $('#vis'+days+' .why').html('No data for today')
      }
    }

  });
}


bs.Arc = function(options){
  var that        = this,
      el          = options.el,
      interval    = options.interval,
      scale       = options.scale,
      secFilter   = options.secFilter || 300,
      ticks       = options.ticks,
      format      = options.format,
      color       = pv.Colors.category19(),
      active      = '',
      width       = el.width(),
      height      = el.height(),
      lineWidth   = 15,
      graph       = {},
      secondsArray= {},
      fontsize    = 18,
      labelHeight = 20,
      ruleHeight  = 20,
      maxy        = 0;


  that.getTime = function(){
    return totalTime(pv.sum( d3.merge(d3.values(secondsArray)) ));
  }

  that.render = function(json){
    // account for activity within an hour (resucetime only returns whole hours)
    graph.nodes = expandTime(json);
    // add interval bounds
    //graph.nodes.unshift([ interval[0] ]);
    //graph.nodes.push([ interval[1] ]);

    var datetimes = graph.nodes.map(function(d){return d[0]}),
        linknest  = d3.nest()
          .key(function(d){ return d[3]; })
          .map(json);

    // adjust secfilter if data volume is low
    var linkedGroups = 0
    d3.values(linknest).forEach(function(l){if(l.length>1) linkedGroups++;})
    if(linkedGroups<6) secFilter=0;

    graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
        return values.map(function(v,i){
          if(!secondsArray[v[3]]) secondsArray[v[3]] = [];
          secondsArray[v[3]].push(v[1]);
          // if there is a second occurance and together is longer secondsFilter
          if(values[i+1] && (v[1]+values[i+1][1]) > secFilter){
            return {source: datetimes.indexOf(v[0]),
                    target: datetimes.indexOf(values[i+1][0]),
                    group: v[3],
                    value: v[1]+values[i+1][1]}
          }else{
            return []
          }
        });
      })));

    if(graph.links.length>0){

      var y = d3.scale.linear().domain([1,d3.max( d3.merge(d3.values(secondsArray)) )]).range([1,lineWidth]);

      var vis = new pv.Panel()
          .canvas(el.attr('id'))
          .width(width)
          .height(height)
          .bottom(ruleHeight);

      var g = vis.add(pv.Panel);

      var layout = g.add(pv.Layout.Arc)
          .nodes(graph.nodes)
          .links(graph.links)
          .overflow('hidden');


      layout.node.add(pv.Dot)
        .data(function(){return layout.nodes().map(function(n){
          n.x = scale(n[0]);
          return n;
          })
        }).visible(false);

      layout.link.add(pv.Line)
        .def("active", -1)
        .strokeStyle(function(d,l){return color(l.group).alpha(0.5)})
        .lineWidth(function(n,l){return y(l.linkValue)})
        .event("mouseover", function(d){active=d[3];return  this.active(this.index).parent})
        .event("mouseout", function(){active='';return  this.active(-1).parent})
        .visible(function(d){return active=='' || d[3]==active})
        .add(pv.Label)
          .data(function(p){
            return [{ group: p.group,
                      value: p.linkValue,
                      x: (p.sourceNode.x + p.targetNode.x) / 2,
                      y: ((p.sourceNode.x - p.targetNode.x) / 2) + p.sourceNode.y - (y(p.linkValue/2)) - (fontsize/1.5) //since middle aligned
                    }]
          })
          .textAlign("right")
          .textBaseline("middle")
          .textStyle('#fff')
          .font(fontsize+"px sans-serif")
          .visible(function(p){return this.proto.active() == this.index})
          .text(function(p){ return p.group})
          .anchor('right').add(pv.Label)
            .textBaseline("middle")
            .font(fontsize+"px sans-serif")
            .textAlign("left")
            .textMargin(8)
            .textStyle('#444')
            .text(function(p){return totalTimeFor(p.group)});


      g.add(pv.Rule)
        .data(ticks)
        .left(scale)
        .bottom(-ruleHeight/2)
        .height(8)
        .strokeStyle("#444")
        .anchor('bottom').add(pv.Label)
          .textStyle('#444')
          .textBaseline("top")
          .textMargin(0)
          .textAlign(function(){return this.index==0 ? 'left' : this.index==ticks.length-1 ? 'right' : 'center'})
          .text(function(d){return formatedHour(d,this.index)});

      vis.render();


      var svg = d3.select(vis.scene.$g);

      // determine max arc height, accounting for its stroke
      svg.selectAll('path').forEach(
       function(e){
         e.forEach(function(d){
           maxy = Math.max(maxy, d.getBBox().height+(d.getAttribute('stroke-width')/2));
         })
       })

      // adjust position and height
      svg.select('g')
        .attr("transform", "translate(0," + -(height-maxy-(fontsize*2)) + ")");

      var newheight = maxy+(fontsize*2);
      svg.select('rect').attr('height',newheight).attr('y',(height-maxy-(fontsize*2)))
      svg.attr('height', newheight+ruleHeight);
    }
  };

  that.render(options.json);



  function expandTime(array){
    return array.map(function(d){
      d[0] = new Date(d[0]);
      d[0].setSeconds(d[1]);
      return d
    });
  };

  function totalTimeFor(group){
    return totalTime( pv.sum(secondsArray[group]) );
  };

  function totalTime(seconds){
    var time = seconds/60/60;
    h = parseInt(time.toFixed(0))
    m = Math.round((time-h)*60)

    if(h>0){
      return m>0 ? h+'hrs '+m+'mins' : h+'hrs';
    }else{
      return m+'mins';
    }
  };

  function formatedHour(d,i){
    if(format(new Date(d))==12 && (i==0 || i==ticks.length-1)){
      return format(new Date(d))+'am';
    }else if(format(new Date(d))==12 && i!=0){
      return format(new Date(d))+'pm';
    }else{
      return format(new Date(d));
    }
  };
}