(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{318:function(e,t,r){"use strict";r.r(t);var i=r(120),a=r(24),n=r(48),s=r(8);t.default=function(e){e.abilities[45]=[{trigger:"onReset",require:function(){return this.testRequirements()},activate:function(){this.creature.isFatigued()&&(this.isUpgraded()&&this.creature.heal(Math.floor(this.creature.stats.regrowth/2),!0),this.creature.stats.meditation>0&&this.creature.recharge(Math.floor(this.creature.stats.meditation/2)))}},{trigger:"onQuery",_targetTeam:a.a.Enemy,require:function(){return!!this.testRequirements()&&!!this.atLeastOneTarget(e.grid.getHexMap(this.creature.x-3,this.creature.y-2,0,!1,n.k),{team:this._targetTeam})},query:function(){var t=this,r=this.creature;e.grid.queryCreature({fnOnConfirm:function(){t.animation.apply(t,arguments)},team:this._targetTeam,id:r.id,flipped:r.flipped,hexes:e.grid.getHexMap(r.x-3,r.y-2,0,!1,n.k)})},activate:function(t){this.end();var r=new i.a(this.creature,this.damages,1,[],e);t.takeDamage(r),this.isUpgraded()&&t.takeDamage(r)}},{trigger:"onQuery",_targetTeam:a.a.Both,require:function(){return!!this.testRequirements()&&!!this.testDirection({team:this._targetTeam,sourceCreature:this.creature})},query:function(){var t=this,r=this.creature;e.grid.queryDirection({fnOnConfirm:function(){t.animation.apply(t,arguments)},flipped:r.player.flipped,team:this._targetTeam,id:r.id,requireCreature:!0,x:r.x,y:r.y,sourceCreature:r})},activate:function(t,r){this.end();for(var a=s.e(t).creature,n=e.grid.getHexLine(a.x,a.y,r.direction,a.flipped),u=new i.a(this.creature,this.damages,1,[],e),c=a.takeDamage(u),o=0;c.kill&&!(++o>=n.length);){var h=n[o];if(h.creature){a=h.creature;var g=this.damages.sonic+(this.isUpgraded()?9:0);if(g<=0)break;u=new i.a(this.creature,{sonic:g},1,[],e),c=a.takeDamage(u)}}}},{trigger:"onQuery",_targetTeam:a.a.Both,_getDirections:function(){return this.testDirections({flipped:this.creature.player.flipped,team:this._targetTeam,id:this.creature.id,requireCreature:!0,x:this.creature.x,y:this.creature.y,distance:1,sourceCreature:this.creature,directions:[1,1,1,1,1,1],includeCreature:!0,stopOnCreature:!0})},require:function(){if(!this.testRequirements())return!1;for(var t=this._getDirections(),r=0;r<t.length;r++)if(1===t[r])return this.message="",!0;return this.message=e.msg.abilities.noTarget,!1},query:function(){var t=this,r=this.creature;e.grid.queryDirection({fnOnConfirm:function(){t.animation.apply(t,arguments)},flipped:r.player.flipped,team:this._targetTeam,id:r.id,directions:this._getDirections(),requireCreature:!0,x:r.x,y:r.y,sourceCreature:r})},activate:function(t,r){var a=this;this.end();!function t(n,s,u){var c=new i.a(a.creature,{crush:s},1,[],e);if(!(n.takeDamage(c).kill||u<=0)){var o=e.grid.getHexLine(n.x,n.y,r.direction,!1);o=o.splice(1,u+1);for(var h=null,g=null,d=0;d<o.length&&(g=o[d],d!==o.length-1)&&o[d].isWalkable(n.size,n.id,!0);d++)h=o[d];var l=function(){if(g.creature===n&&4===r.direction){var i=e.grid.getHexLine(n.x,n.y,r.direction,!1);i=i.splice(n.size),g=i.length>0&&i[0].creature!==n?i[0]:null}if(null!==g&&g!==h&&g.creature){var c=a.isUpgraded()?s:s-5,o=a.isUpgraded()?u:u-1;t(g.creature,c,o)}else e.activeCreature.queryMove()};null!==h?n.moveTo(h,{callback:l,ignoreMovementPoint:!0,ignorePath:!0,overrideSpeed:400,animation:"push"}):l()}}(s.e(t).creature,this.damages.crush,3)}}]}}}]);