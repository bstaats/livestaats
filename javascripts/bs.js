if(bs === undefined) var bs = {};

bs.Arc = function(options){
  var that        = this,
      el          = options.el,
      interval    = options.interval.map(function(d){return new Date(d)}),
      hours       = (interval[1].getTime() - interval[0].getTime()) / (1000*60*60),
      secFilter   = options.secFilter || 300,
      color       = pv.Colors.category19(),
      active      = '',
      width       = el.property('clientWidth'),
      height      = el.property('clientHeight'),
      lineWidth   = 15,
      graph       = {},
      secondsArray= [],
      fontsize    = 18,
      labelHeight = 20,
      ruleHeight  = 20,
      maxy        = 0;


  that.render = function(json){
    range2dates = function(d){ return new Date(interval[0].getFullYear(),interval[0].getMonth(),interval[0].getDate(),d)};

    function expandTime(array){
      return array.map(function(d){
        d[0] = new Date(d[0]);
        d[0].setSeconds(d[1]);
        return d
      });
    }

    // account for activity within an hour (resucetime only returns whole hours)
    graph.nodes = expandTime(json);
    // add interval bounds
    graph.nodes.unshift([ interval[0] ]);
    graph.nodes.push([ interval[1] ]);

    var ticks     = d3.range(0,hours,2).map(range2dates),
        datetimes = graph.nodes.map(function(d){return d[0]}),
        x         = pv.Scale.linear().domain(interval).range(0,width),
        format    = pv.Format.date("%I");

    if(hours>24){
      $('#support .info .value').html(pv.Format.date('%b %d %Y')(new Date()));
      $('#support .info .label').html('This Week');
      format    = pv.Format.date("%a %d %b");
      ticks     = x.ticks(12);
      secFilter = 600;
    }else{
      $('#support .info .value').html(pv.Format.date('%b %d %Y')(new Date()));
    }

    var linknest  = d3.nest()
      .key(function(d){ return d[3]; })
      .map(json);

  graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
      return values.map(function(v,i){
        // if there is a second occurance and together is longer secondsFilter
        if(values[i+1] && (v[1]+values[i+1][1]) > secFilter){
          secondsArray.push(v[1]);
          return {source: datetimes.indexOf(v[0]),
                  target: datetimes.indexOf(values[i+1][0]),
                  group: v[3],
                  value: v[1]+values[i+1][1]}
        }else{
          return []
        }
      });
    })));

    var y = d3.scale.linear().domain([1,d3.max(secondsArray)]).range([1,lineWidth]);

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
        n.x = x(n[0]);
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
                    y: ((p.sourceNode.x - p.targetNode.x) / 2) + p.sourceNode.y - (y(p.linkValue/2)) - fontsize //since middle aligned
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
          .text(function(p){return totalTime(p.value)});


    g.add(pv.Rule)
      .data(ticks)
      .left(x)
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

    $('#support .total .value').html(totalTime(pv.sum(secondsArray)))

    // determine max arc height, accounting for its stroke
    d3.selectAll('svg path').forEach(
     function(e){
       e.forEach(function(d){
         maxy = Math.max(maxy, d.getBBox().height+(d.getAttribute('stroke-width')/2));
       })
     })

    // adjust position and height
    d3.select('svg g')
      .attr("transform", "translate(0," + -(height-maxy-(fontsize*1.5)) + ")")

    height = maxy+ruleHeight+(fontsize*1.5);
    d3.select('#vis').style('height', height+'px');
    d3.select('#vis svg').attr('height', height);


    function totalTime(seconds){
      var d = new Date(interval[0].getFullYear(),interval[0].getMonth(),interval[0].getDay());
      d.setSeconds(seconds);
      var h = d.getHours();
      var m = d.getMinutes();
      if(h>0){
        return m>0 ? h+'hrs '+m+'mins' : h+'hrs';
      }else{
        return m+'mins';
      }
    }

    function formatedHour(d,i){
      if(format(new Date(d))==12 && i==0){
        return format(new Date(d))+'am';
      }else if(format(new Date(d))==12 && i!=0){
        return format(new Date(d))+'pm';
      }else{
        return format(new Date(d));
      }
    }
  }

  that.render(options.json);
}