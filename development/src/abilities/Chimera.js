/*
*
*	Chimera abilities
*
*/
G.abilities[45] =[

// 	First Ability: Cyclic Duality
{
	trigger: "onReset",

	//	require() :
	require : function(){
		return this.testRequirements();
	},

	activate: function() {
		// Only activate when fatigued
		if (!this.creature.isFatigued()) {
			return;
		}

		if (this.isUpgraded()) {
			this.creature.heal(Math.floor(this.creature.stats.regrowth / 2), true);
		}
		if (this.creature.stats.meditation > 0) {
			this.creature.recharge(Math.floor(this.creature.stats.meditation / 2));
		}
	}
},



//	Second Ability: Tooth Fairy
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	//	require() :
	require : function() {
		if( !this.testRequirements() ) return false;

		if( !this.atLeastOneTarget( G.grid.getHexMap(this.creature.x-3,this.creature.y-2,0,false,frontnback3hex),"enemy" ) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}

		return true;
	},

	//	query() :
	query : function() {
		var ability = this;
		var chimera = this.creature;

		G.grid.queryCreature( {
			fnOnConfirm : function() { ability.animation.apply(ability, arguments); },
			team : 0, // Team, 0 = enemies
			id : chimera.id,
			flipped : chimera.flipped,
			hexs : G.grid.getHexMap(chimera.x - 3, chimera.y - 2, 0, false, frontnback3hex),
		});
	},


	//	activate() :
	activate : function(target, args) {
		var ability = this;

		ability.end();

		var damage = new Damage(
			ability.creature, // Attacker
			ability.damages, // Damage Type
			1, // Area
			[]	// Effects
		);
		target.takeDamage(damage);
		if (this.isUpgraded()) {
			// Second attack
			target.takeDamage(damage);
		}
	},
},

//	Third Ability: Disturbing Sound
{
	//	Type : Can be "onQuery", "onStartPhase", "onDamage"
	trigger : "onQuery",

	directions: [1,1,1,1,1,1],

	//	require() :
	require : function() {
		if( !this.testRequirements() ) return false;

		if( !this.testDirection({ team : "both", directions : this.directions }) ) {
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	//	query() :
	query : function(){
		var ability = this;
		var chimera = this.creature;

		G.grid.queryDirection({
			fnOnConfirm : function(){ ability.animation.apply(ability, arguments); },
			flipped : chimera.player.flipped,
			team : "both",
			id : chimera.id,
			requireCreature : true,
			x : chimera.x,
			y : chimera.y,
			directions : this.directions,
		});
	},


	//	activate() :
	activate : function(path, args) {
		var ability = this;

		ability.end();

		var target = path.last().creature;
		var hexes = G.grid.getHexLine(
			target.x, target.y, args.direction, target.flipped);

		var damage = new Damage(
			ability.creature, // Attacker
			ability.damages, // Damage Type
			1, // Area
			[]	// Effects
		);
		result = target.takeDamage(damage);

		var i = 0;
		while(result.kill) {
			i++;
			if (i >= hexes.length) {
				break;
			}
			var hex = hexes[i];
			if (!hex.creature) {
				continue;
			}
			target = hex.creature;

			// extra sonic damage if upgraded
			var sonic = result.damages.sonic + this.isUpgraded() ? 7 : 0;
			if (sonic <= 0) {
				break;
			}
			damage = new Damage(
				ability.creature, // Attacker
				{sonic: sonic}, // Damage Type
				1, // Area
				[]	// Effects
			);
			result = target.takeDamage(damage);
		}
	}
},



//	Fourth Ability: Chain Lightning
{
	//	Type : Can be "onQuery", "onStartPhase", "onDamage"
	trigger : "onQuery",

	directions : [0,1,0,0,1,0],

	require : function() {
		if( !this.testRequirements() ) return false;

		if( !this.testDirection({ team : "both", directions : this.directions }) ) {
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	//	query() :
	query : function(){
		var ability = this;
		var chimera = this.creature;

		G.grid.queryDirection( {
			fnOnConfirm : function(){ ability.animation.apply(ability, arguments); },
			flipped : chimera.player.flipped,
			team : "both",
			id : chimera.id,
			requireCreature : true,
			x : chimera.x,
			y : chimera.y,
			directions : this.directions,
		});
	},


	//	activate() :
	activate : function(path, args) {
		var ability = this;

		ability.end();

		var targets = [];
		targets.push(path.last().creature); // Add First creature hit
		var nextdmg = $j.extend({},ability.damages); // Copy the object

		// For each Target
		for (var i = 0; i < targets.length; i++) {
			var trg = targets[i];

			var damage = new Damage(
				ability.creature, // Attacker
				nextdmg, // Damage Type
				1, // Area
				[] // Effects
			);
			nextdmg = trg.takeDamage(damage);

			if(nextdmg.damages == undefined) break; // If attack is dodge
			if(nextdmg.kill) break; // If target is killed
			if(nextdmg.damages.total <= 0) break; // If damage is too weak
			if(nextdmg.damageObj.status != "") break;
			delete nextdmg.damages.total;
			nextdmg = nextdmg.damages;

			// Get next available targets
			nextTargets = ability.getTargets(trg.adjacentHexs(1,true));

			nextTargets.filter(function() {
				if ( this.hexsHit == undefined ) return false; // Remove empty ids
				return (targets.indexOf(this.target) == -1) ; // If this creature has already been hit
			})

			// If no target
			if(nextTargets.length == 0) break;

			// Best Target
			var bestTarget = { size: 0, stats:{ defense:-99999, shock:-99999 } };
			for (var j = 0; j < nextTargets.length; j++) { // For each creature
				if (typeof nextTargets[j] == "undefined") continue; // Skip empty ids.

				var t = nextTargets[j].target;
				// Compare to best target
				if(t.stats.shock > bestTarget.stats.shock){
					if( ( t == ability.creature && nextTargets.length == 1 ) || // If target is chimera and the only target
						t != ability.creature ) { // Or this is not chimera
						bestTarget = t;
					}
				} else {
					continue;
				}

			};

			if( bestTarget instanceof Creature ){
				targets.push(bestTarget);
			}else{
				break;
			}
		};

	},
}

];
