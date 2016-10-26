/*
*
*	Abolished abilities
*
*/
G.abilities[7] =[

// 	First Ability: Burning Heart
{
	trigger: "onUnderAttack",

	// 	require() :
	require : function(damage) {
		if( !this.testRequirements() ) return false;
		if (damage === undefined) {
			damage = { type: "target" }; // For the test function to work
		}
		return true;
	},

	//  activate() :
	activate : function(damage, target) {
		if(this.creature.id === damage.attacker.id) {
			target.stats.burn -= 1;
			if(this.isUpgraded() === true) {
				this.creature.stats.burn += 1;
			}
		}
		this.end();
	},
},


// 	Second Ability: Fiery Touch
{
	//	Type : Can be "onQuery", "onStartPhase", "onDamage"
	trigger : "onQuery",

	distance : 3,
	_targetTeam: Team.enemy,

	// 	require() :
	require : function() {
		if(!this.testRequirements()) return false;
		if (!this.testDirection({
				team: this._targetTeam, distance: this.distance,
				sourceCreature: this.creature
			})) {
			return false;
		}
		return true;
	},

	// 	query() :
	query : function() {
		var ability = this;
		var crea = this.creature;

		if(this.isUpgraded()) this.distance = 5;

		G.grid.queryDirection({
			fnOnConfirm : function() { ability.animation.apply(ability, arguments); },
			flipped : crea.player.flipped,
			team: this._targetTeam,
			id : this.creature.id,
			requireCreature : true,
			x : crea.x,
			y : crea.y,
			distance : this.distance,
			sourceCreature : crea,
		});
	},


	//	activate() :
	activate : function(path, args) {
		var ability = this;
		ability.end();

		var target = path.last().creature;

		var damage = new Damage(
			ability.creature, // Attacker
			ability.damages, // Damage Type
			1, // Area
			[]	// Effects
		);
		target.takeDamage(damage);
	},
},



// 	Third Ability: Wild Fire
{
	//	Type : Can be "onQuery", "onStartPhase", "onDamage"
	trigger : "onQuery",

	// 	require() :
	require : function() {
		return this.testRequirements();
	},

	range : 6,

	// 	query() :
	query : function() {
		var ability = this;
		var crea = this.creature;

		crea.queryMove({
			noPath : true,
			isAbility : true,
			range : G.grid.getFlyingRange(crea.x, crea.y, this.range, crea.size, crea.id),
			callback : function() { delete arguments[1]; ability.animation.apply(ability, arguments); },
		});
	},


	//	activate() :
	activate : function(hex, args) {
		var ability = this;
		ability.end();

		if( this.isUpgraded() ) {
			this.range += 1;
		}


		var targets = ability.getTargets(ability.creature.adjacentHexs(1));

		targets.each(function() {
			if (!(this.target instanceof Creature)) return;
		});

		// Leave a Firewall in current location
		var effectFn = function(effect,crea) {
			crea.takeDamage(
				new Damage(effect.attacker, ability.damages , 1, []),
				{ isFromTrap: true });
			this.trap.destroy();
		};

		var requireFn = function() {
			if (this.trap.hex.creature === 0) return false;
			return this.trap.hex.creature.type != "P7";
		};

    var crea = this.creature;
		crea.hexagons.each(function() {
			this.createTrap("firewall", [
				new Effect(
					"Firewall",crea,this,"onStepIn",
					{ requireFn: requireFn, effectFn: effectFn,	attacker: crea }
				),
			],crea.player, { turnLifetime : 1, ownerCreature : crea, fullTurnLifetime : true } );
		});

		ability.creature.moveTo(hex, {
			ignoreMovementPoint : true,
			ignorePath : true,
			animation : "teleport",
			callback : function() {
				G.activeCreature.queryMove();
			}
		});
	},
},



// 	Fourth Ability: Greater Pyre
{
	//	Type : Can be "onQuery", "onStartPhase", "onDamage"
	trigger : "onQuery",

	// 	require() :
	require : function() {
		return this.testRequirements();
	},

	// 	query() :
	query : function() {
		var ability = this;
		var crea = this.creature;

		// var inRangeCreatures = crea.hexagons[1].adjacentHex(1);

		var range = crea.adjacentHexs(1);

		G.grid.queryHexs( {
			fnOnConfirm : function() { ability.animation.apply(ability, arguments); },
			fnOnSelect : function(hex, args) {
				range.each(function() {
					this.overlayVisualState("creature selected weakDmg player"+this.creature.team);
				});
				hex.cleanOverlayVisualState();
				hex.overlayVisualState("creature selected player"+G.activeCreature.team);
			},
			id : this.creature.id,
			hexs : range,
			hideNonTarget : true,
		});
	},


	//	activate() :
	activate : function(hex, args) {
		var ability = this;
		ability.end();

		var crea = this.creature;
		var aoe = crea.adjacentHexs(1);
		var targets = ability.getTargets(aoe);

		if(this.isUpgraded()) this.damages.burn = 30;

		targets.each(function() {
			this.target.takeDamage(new Damage(
				ability.creature, // Attacker
				ability.damages, // Damage Type
				1, // Area
				[]	// Effects
			));
		});

	},
}

];
