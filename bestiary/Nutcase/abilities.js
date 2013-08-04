/*
*
*	Nutcase abilities
*
*/
abilities[40] =[

// 	First Ability: Hunting Horn
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onStartPhase",

	//	require() :
	require : function(){
		if( !this.testRequirements() ) return false;
		if( this.atLeastOneTarget( this.creature.adjacentHexs(1),"ennemy" ) ){
			return false;
		}
		return true;
	},

	//	activate() : 
	activate : function() {
		this.end();

		for (var i = 1; i < 99; i++) {
			var hexs = this.creature.adjacentHexs(i);
			if( !this.atLeastOneTarget( hexs,"ennemy" ) ) continue;

			var targets = this.getTargets(hexs);

			if(targets.length>0){
				var target = (this.creature.flipped) ? { x : 9999 } : { x : -1 };
				for (var j = 0; j < targets.length; j++) {
					if(targets[j] == undefined) continue;
					if(targets[j].target.isAlly(this.creature.team)) continue;

					if(this.creature.flipped){
						if(targets[j].target.x < target.x) target = targets[j].target;
					}else{
						if(targets[j].target.x > target.x) target = targets[j].target;
					}
				};
				break;
			}
		};

		if( !(target instanceof Creature) ) return;


		//Search best hex
		G.grid.cleanReachable(); //If not pathfinding will bug
		G.grid.cleanPathAttr(true); //Erase all pathfinding datas
		astar.search(G.grid.hexs[this.creature.y][this.creature.x],new Hex(-2,-2,null),this.creature.size,this.creature.id); 

		var bestHex = {g:9999};

		for (var i = 1; i < 99; i++) {
			var hexs = target.adjacentHexs(i);
			for (var i = 0; i < hexs.length; i++) {
				if( hexs[i].g != 0 && hexs[i].g < bestHex.g ) bestHex = hexs[i];
			};
			if(bestHex instanceof Hex) break;
		};

		this.creature.moveTo( bestHex, { clampDist: 2, ignoreMovementPoint: true } );
		this.creature.delayable = false;
	},
},



//	Second Ability: Hammer Time
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		crush : 12,
		pierce : 6
	},

	//	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		if( !this.atLeastOneTarget( this.creature.getHexMap(frontnback2hex),"ennemy" ) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}

		return true;
	},

	//	query() :
	query : function(){
		var ability = this;

		G.grid.queryCreature({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 0, //Team, 0 = ennemies
			id : this.creature.id,
			flipped : this.creature.flipped,
			hexs : this.creature.getHexMap(frontnback2hex)
		});
	},


	//	activate() : 
	activate : function(target,args) {
		var ability = this;
		ability.end();

		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		target.takeDamage(damage);

		var effect = new Effect(
			"Hammer Time", //Name
			ability.creature, //Caster
			target, //Target
			"", //Trigger
			{ alterations : {meditation : -1} }
		);

		target.addEffect(effect);
	},
},



//	Thirt Ability: Fishing Hook
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		pierce : 10,
		crush : 10,
	},

	//	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		if( !this.atLeastOneTarget( this.creature.getHexMap(inlinefront2hex),"ennemy" ) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	//	query() :
	query : function(){
		var ability = this;

		G.grid.queryCreature({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 0, //Team, 0 = ennemies
			id : this.creature.id,
			flipped : this.creature.flipped,
			hexs : this.creature.getHexMap(inlinefront2hex),
		});
	},


	//	activate() : 
	activate : function(target,args) {
		var ability = this;
		ability.end();

		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		result = target.takeDamage(damage);

		// Swap places
		if( target.size > 2 ) return;

		this.creature.moveTo(
			G.grid.hexs[target.y][target.x],
			{
				ignorePath:true,
				ignoreMovementPoint:true,
				callback:function(){ ability.creature.updateHex(); target.updateHex(); G.grid.updateDisplay(); }
			}
		);
		target.moveTo(
			G.grid.hexs[this.creature.y][ ( target.size == 1 ) ? this.creature.x-1 : this.creature.x ],
			{
				ignorePath:true,
				ignoreMovementPoint:true,
				callback:function(){ ability.creature.updateHex(); target.updateHex(); G.grid.updateDisplay(); }
			}
		);
	},
},



//	Fourth Ability: Chain Lightning
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",
	
	require : function(){
		if( !this.testRequirements() ) return false;
		return true;
	},

	damages : {
		crush : 10,
	},

	//	query() :
	query : function(){
		this.animation();
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = this;
		ability.end();

		var effect = new Effect(
			"Tentacle Bush", //Name
			ability.creature, //Caster
			ability.creature, //Target
			"onDamage", //Trigger
			{ 
				requireFn : function(damage){
					return damage.melee;
				},
				effectFn : function(effect,damage){
					var retailation = new Damage(
						this.owner, //Attacker
						"target", //Attack Type
						ability.damages, //Damage Type
						1, //Area
						[]	//Effects
					);
					damage.attacker.takeDamage(retailation);
				},
				alterations : {defense : "*2"},
				turn : G.turn,
				turnLifetime : 1,
				deleteTrigger : "startOfTurn"
			}
		);

		ability.creature.addEffect(effect);
	},
}

];
