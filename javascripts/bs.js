if(bs === undefined) var bs = {};

bs.Arc = function(options){
  var that      = this,
      el        = options.el,
      interval  = options.interval.map(function(d){return new Date(d)}),
      hours     = (interval[1].getTime() - interval[0].getTime()) / (1000*60*60),
      secFilter = options.secFilter || 300,
      color     = pv.Colors.category19(),
      width     = el.property('clientWidth'),
      height    = el.property('clientHeight'),
      graph     = {},
      maxy      = -Infinity,
      keys      = [];


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
      $('#support span').html('The week of '+pv.Format.date('%b %d %Y')(new Date()));
      format    = pv.Format.date("%a %d %b");
      ticks     = x.ticks(12);
      secFilter = 600;
    }else{
      $('#support span').html('Today '+pv.Format.date('%b %d %Y')(new Date()));
    }

    var linknest  = d3.nest()
      .key(function(d){ return d[3]; })
      .map(json);

  graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
      return values.map(function(v,i){
        // if there is a second occurance and together is longer secondsFilter
        if(values[i+1] && (v[1]+values[i+1][1]) > secFilter){
          var seconds = v[1]+values[i+1][1];
          maxy = Math.max(maxy, seconds);
          return {source:datetimes.indexOf(v[0]),
                  target:datetimes.indexOf(values[i+1][0]),
                  group: v[3],
                  value:seconds}
        }else{
          return []
        }
      });
    })));

    var y = d3.scale.linear().domain([1,maxy]).range([2,height/10]);

    var vis = new pv.Panel()
        .canvas(el.attr('id'))
        .width(width)
        .height(height)
        .bottom(20);

    var layout = vis.add(pv.Layout.Arc)
        .nodes(graph.nodes)
        .links(graph.links);

    layout.node.add(pv.Dot)
      .data(function(){return layout.nodes().map(function(n){
        n.x = x(n[0]);
        return n;
        })
      }).fillStyle(null).strokeStyle(null);

    layout.link.add(pv.Line)
      .def("active", -1)
      .strokeStyle(function(d,l){return color(l.group).alpha(0.5)})
      .lineWidth(function(n,l){return y(l.linkValue)})
      .event("mouseover", function(){return  this.active(this.index).parent})
      .event("mouseout", function(){return  this.active(-1).parent})
      .add(pv.Label)
        .data(function(p){return [{
          group: p.group,
          value: p.linkValue,
          x: (p.sourceNode.x + p.targetNode.x) / 2,
          y: ((p.sourceNode.x - p.targetNode.x) / 2) + p.sourceNode.y - (y(p.linkValue/2)) - 20 // 20 margin
        }]})
        .textAlign("center")
        .textBaseline("bottom")
        .textStyle('#fff')
        .font("18px sans-serif")
        .visible(function(){return this.proto.active() == this.index})
        .text(function(p){return p.group});//+' '+pv.Format.date('%M:%S')(new Date(p.value*1000))});

    vis.add(pv.Rule)
      .data(ticks)
      .left(x)
      .bottom(-10)
      .height(8)
      .strokeStyle("#444")
      .anchor('bottom').add(pv.Label)
        .textStyle('#444')
        .textBaseline("top")
        .textMargin(0)
        .textAlign(function(){return this.index==0 ? 'left' : this.index==ticks.length-1 ? 'right' : 'center'})
        .text(function(d){return formatedHour(d,this.index)});

    vis.render();

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