/*
*
*	Ice Demon abilities
*
*/
abilities[6] =[

// 	First Ability: Snow Storm
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onEndPhase",

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;
		return true;
	},

	//	activate() : 
	activate : function(){
		var ability = this;
		this.end();

		//Check all creatures
		for (var i = 1; i < G.creatures.length; i++) {
			if( G.creatures[i] instanceof Creature ){
				var crea = G.creatures[i];

				if( !crea.isAlly( ability.creature.team ) && !crea.dead && crea.findEffect( "Snow Storm" ).length == 0 ){
					var effect = new Effect(
						"Snow Storm", //Name
						ability.creature, //Caster
						crea, //Target
						"", //Trigger
						{ alterations: ability.effects[0] } //Optional arguments
					)
					crea.addEffect(effect);
				}
			}
		};
	},
},


// 	Second Ability: Head Bash
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	distance : 1,

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;
		var test = this.testDirection({
			team : "ennemy",
			distance : this.distance,
			sourceCreature : this.creature,
		});
		if( !test ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		G.grid.queryDirection({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			flipped : crea.player.flipped,
			team : 0, //enemies
			id : this.creature.id,
			requireCreature : true,
			x : crea.x,
			y : crea.y,
			distance : this.distance,
			sourceCreature : crea,
		});
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = this;
		ability.end();

		var direction = path.last().direction;
		var target = path.last().creature;

		var dir = [];
		switch( direction ){
			case 0: //Upright
				dir = G.grid.getHexMap(target.x,target.y-8,0,target.flipped,diagonalup).reverse();
				break;
			case 1: //StraitForward
				dir = G.grid.getHexMap(target.x,target.y,0,target.flipped,straitrow);
				break;
			case 2: //Downright
				dir = G.grid.getHexMap(target.x,target.y,0,target.flipped,diagonaldown);
				break;
			case 3: //Downleft
				dir = G.grid.getHexMap(target.x,target.y,-4,target.flipped,diagonalup);
				break;
			case 4: //StraitBackward
				dir = G.grid.getHexMap(target.x,target.y,0,!target.flipped,straitrow);
				break;
			case 5: //Upleft
				dir = G.grid.getHexMap(target.x,target.y-8,-4,target.flipped,diagonaldown).reverse();
				break;
			default:
				break;
		}

		var pushed = false;

		if(dir.length > 1) {
			if(dir[1].isWalkable(target.size,target.id,true)){
				target.moveTo(dir[1],{
					ignoreMovementPoint : true,
					ignorePath : true,
					callback : function(){
						G.activeCreature.queryMove();
					},
					animation : "push",
				});
				pushed = true;
			}
		}
		var d = $j.extend({},ability.damages);

		if(!pushed){
			d.crush = d.crush * 2;	
		}

		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			d, //Damage Type
			1, //Area
			[]	//Effects
		);
		target.takeDamage(damage);
	},
},



// 	Thirt Ability: Frost Bite
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		var crea = this.creature;
		var hexs = G.grid.getHexMap(crea.x,crea.y-2,0,false,straitrow).filterCreature(true,true,crea.id,crea.team).concat(
			G.grid.getHexMap(crea.x,crea.y-2,0,false,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,0,false,straitrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,0,false,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y+2,0,false,straitrow).filterCreature(true,true,crea.id,crea.team),

			G.grid.getHexMap(crea.x,crea.y-2,2,true,straitrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y-2,2,true,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,2,true,straitrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,2,true,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y+2,2,true,straitrow).filterCreature(true,true,crea.id,crea.team));

		if( !this.atLeastOneTarget( hexs, "ennemy" ) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}

		return true;

	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		var choices = [
			//Front
			G.grid.getHexMap(crea.x,crea.y-2,0,false,straitrow).filterCreature(true,true,crea.id,crea.team).concat(
			G.grid.getHexMap(crea.x,crea.y-2,0,false,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,0,false,straitrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,0,false,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y+2,0,false,straitrow).filterCreature(true,true,crea.id,crea.team)),
			//Behind
			G.grid.getHexMap(crea.x,crea.y-2,2,true,straitrow).filterCreature(true,true,crea.id,crea.team).concat(
			G.grid.getHexMap(crea.x,crea.y-2,2,true,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,2,true,straitrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y,2,true,bellowrow).filterCreature(true,true,crea.id,crea.team),
			G.grid.getHexMap(crea.x,crea.y+2,2,true,straitrow).filterCreature(true,true,crea.id,crea.team))
		];
		
		G.grid.queryChoice({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); }, //fnOnConfirm
			team : 0, 
			requireCreature : 1,
			id : crea.id,
			flipped : crea.flipped,
			choices : choices,
		});

	},


	//	activate() : 
	activate : function(choice,args) {
		var ability = this;
		var crea = this.creature;

		for (var i = 0; i < choice.length; i++) {
			if( choice[i].creature instanceof Creature ){

				choice[i].creature.takeDamage( 
					new Damage(
						ability.creature, //Attacker
						"area", //Attack Type
						ability.damages, //Damage Type
						1, //Area
						[]	//Effects
					)
				);
			}
		};
	},
},



// 	Fourth Ability: Frozen Orb
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	directions : [0,1,0,0,1,0],


	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;
		var test = this.testDirection({
			team : "ennemy",
			directions : this.directions,
			sourceCreature : this.creature,
		});
		if( !test ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		G.grid.queryDirection({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			flipped : crea.player.flipped,
			team : 0, //enemies
			id : this.creature.id,
			requireCreature : true,
			x : crea.x,
			y : crea.y,
			sourceCreature : crea,
		});
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = this;
		ability.end();

		var target = path.last().creature;
		
		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		target.takeDamage(damage);

	},
}

];
