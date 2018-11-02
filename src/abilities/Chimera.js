import { Damage } from '../damage';
import { Team } from '../utility/team';
import * as matrices from '../utility/matrices';
import * as arrayUtils from '../utility/arrayUtils';

/** Creates the abilities
 * @param {Object} G the game object
 * @return {void}
 */
export default G => {
	G.abilities[45] = [
		// 	First Ability: Cyclic Duality
		{
			trigger: 'onReset',

			//	require() :
			require: function() {
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
			trigger: 'onQuery',

			_targetTeam: Team.enemy,

			//	require() :
			require: function() {
				if (!this.testRequirements()) {
					return false;
				}

				if (
					!this.atLeastOneTarget(
						G.grid.getHexMap(
							this.creature.x - 3,
							this.creature.y - 2,
							0,
							false,
							matrices.frontnback3hex
						),
						{
							team: this._targetTeam
						}
					)
				) {
					return false;
				}

				return true;
			},

			//	query() :
			query: function() {
				let ability = this;
				let chimera = this.creature;

				G.grid.queryCreature({
					fnOnConfirm: function() {
						ability.animation(...arguments);
					},
					team: this._targetTeam,
					id: chimera.id,
					flipped: chimera.flipped,
					hexes: G.grid.getHexMap(chimera.x - 3, chimera.y - 2, 0, false, matrices.frontnback3hex)
				});
			},

			//	activate() :
			activate: function(target) {
				let ability = this;

				ability.end();

				let damage = new Damage(
					ability.creature, // Attacker
					ability.damages, // Damage Type
					1, // Area
					[], // Effects
					G
				);
				target.takeDamage(damage);
				if (this.isUpgraded()) {
					// Second attack
					target.takeDamage(damage);
				}
			}
		},

		//	Third Ability: Disturbing Sound
		{
			//	Type : Can be "onQuery", "onStartPhase", "onDamage"
			trigger: 'onQuery',

			_targetTeam: Team.both,

			//	require() :
			require: function() {
				if (!this.testRequirements()) {
					return false;
				}

				if (
					!this.testDirection({
						team: this._targetTeam,
						sourceCreature: this.creature
					})
				) {
					return false;
				}
				return true;
			},

			//	query() :
			query: function() {
				let ability = this;
				let chimera = this.creature;

				G.grid.queryDirection({
					fnOnConfirm: function() {
						ability.animation(...arguments);
					},
					flipped: chimera.player.flipped,
					team: this._targetTeam,
					id: chimera.id,
					requireCreature: true,
					x: chimera.x,
					y: chimera.y,
					sourceCreature: chimera
				});
			},

			//	activate() :
			activate: function(path, args) {
				let ability = this;

				ability.end();

				let target = arrayUtils.last(path).creature;
				let hexes = G.grid.getHexLine(target.x, target.y, args.direction, target.flipped);

				let damage = new Damage(
					ability.creature, // Attacker
					ability.damages, // Damage Type
					1, // Area
					[], // Effects
					G
				);
				let result = target.takeDamage(damage);

				let i = 0;
				while (result.kill) {
					i++;
					if (i >= hexes.length) {
						break;
					}
					let hex = hexes[i];
					if (!hex.creature) {
						continue;
					}
					target = hex.creature;

					// extra sonic damage if upgraded
					let sonic = ability.damages.sonic + (this.isUpgraded() ? 9 : 0);
					if (sonic <= 0) {
						break;
					}
					damage = new Damage(
						ability.creature, // Attacker
						{
							sonic: sonic
						}, // Damage Type
						1, // Area
						[], // Effects
						G
					);
					result = target.takeDamage(damage);
				}
			}
		},

		// Fourth Ability: Battering Ram
		{
			//	Type : Can be "onQuery", "onStartPhase", "onDamage"
			trigger: 'onQuery',

			_targetTeam: Team.both,

			_getDirections: function() {
				return this.testDirections({
					flipped: this.creature.player.flipped,
					team: this._targetTeam,
					id: this.creature.id,
					requireCreature: true,
					x: this.creature.x,
					y: this.creature.y,
					distance: 1,
					sourceCreature: this.creature,
					directions: [1, 1, 1, 1, 1, 1],
					includeCreature: true,
					stopOnCreature: true
				});
			},

			require: function() {
				if (!this.testRequirements()) {
					return false;
				}

				let directions = this._getDirections();
				for (let i = 0; i < directions.length; i++) {
					if (directions[i] === 1) {
						this.message = '';
						return true;
					}
				}
				this.message = G.msg.abilities.noTarget;
				return false;
			},

			//	query() :
			query: function() {
				let ability = this;
				let chimera = this.creature;

				G.grid.queryDirection({
					fnOnConfirm: function() {
						ability.animation(...arguments);
					},
					flipped: chimera.player.flipped,
					team: this._targetTeam,
					id: chimera.id,
					directions: this._getDirections(),
					requireCreature: true,
					x: chimera.x,
					y: chimera.y,
					sourceCreature: chimera
				});
			},

			activate: function(path, args) {
				let ability = this;
				this.end();

				let knockback = (_target, _crush, _range) => {
					let damage = new Damage(
						ability.creature, // Attacker
						{
							crush: _crush
						}, // Damage Type
						1, // Area
						[], // Effects
						G
					);
					let result = _target.takeDamage(damage);
					// Knock the target back if they are still alive and there is enough range
					if (result.kill || _range <= 0) {
						return;
					}
					// See how far we can knock the target back
					let hexes = G.grid.getHexLine(_target.x, _target.y, args.direction, false);
					// Skip the first hex as it is the same hex as the target
					hexes = hexes.splice(1, _range + 1);
					let hex = null;
					let nextHex = null;
					// See how far the target can be knocked back
					for (let i = 0; i < hexes.length; i++) {
						nextHex = hexes[i];
						// Check that the next knockback hex is valid
						if (i === hexes.length - 1) {
							break;
						}
						if (!hexes[i].isWalkable(_target.size, _target.id, true)) {
							break;
						}
						hex = hexes[i];
					}

					let knockbackEnd = () => {
						// Special case when hitting left: the next hex is still the same
						// creature, so continue in this direction until we reach the next
						// creature
						if (nextHex.creature === _target && args.direction === 4) {
							let nextHexes = G.grid.getHexLine(_target.x, _target.y, args.direction, false);
							nextHexes = nextHexes.splice(_target.size);
							if (nextHexes.length > 0) {
								nextHex = nextHexes[0];
							}
						}
						if (nextHex !== null && nextHex !== hex && nextHex.creature) {
							// Diminishing crush damage if unupgraded
							let crush = ability.isUpgraded() ? _crush : _crush - 5;
							// Diminishing range if unupgraded
							let range = ability.isUpgraded() ? _range : _range - 1;
							knockback(nextHex.creature, crush, range);
						} else {
							G.activeCreature.queryMove();
						}
					};

					if (hex !== null) {
						_target.moveTo(hex, {
							callback: knockbackEnd,
							ignoreMovementPoint: true,
							ignorePath: true,
							overrideSpeed: 400, // Custom speed for knockback
							animation: 'push'
						});
					} else {
						// No knockback distance, but there may be a creature behind the target
						knockbackEnd();
					}
				};

				let target = arrayUtils.last(path).creature;
				let crush = this.damages.crush;
				let range = 3;
				knockback(target, crush, range);
			}
		}
	];
};
