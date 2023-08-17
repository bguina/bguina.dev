jQuery(function() {
  var navbar = { 
    zone: $('#navbar'),
    menu: $($('#navbar nav')[0]),
  };
  var anim = function(hash, fx, time) {
    fx = 'animate '+ fx;
    animend = 'animationend'
    if (typeof time !== undefined) { hash.css('animation-duration', time); }
    hash.removeClass(animend).addClass(fx).on(animend, function() { $(this).removeClass(fx); });
  };

  enquire.register("screen and (min-width:769px)", {
    // small screen
    unmatch : function() {
      navbar.zone.unbind('mouseenter mouseleave');
    },
    // large screen
    match : function() {
      navbar.zone.hover(function() { anim(navbar.menu, 'fadeIn'); });
    },
  });
  // XXX dirty same-height js
  //$('#skills > .row.content').css('height', $('#xppro .container-fluid.content').css('height'));
  for (var idx = 0; idx < document.links.length; idx++) {
    var link = document.links[idx];
    if (link.pathname === link.pathname && link.hash) {
      $(link).click(function(e) {
        if (!$(this.hash).length)
          return;
        e.preventDefault();
        $('html, body').animate({'scrollTop': $(this.hash).offset().top - 55}, 250);
        anim($($(this.hash+' .headline h3')[0]), 'flash');
      });
    }
  }
});

