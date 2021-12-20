import * as $j from 'jquery';
import { Damage } from '../damage';
import { Team, isTeam } from '../utility/team';
import * as matrices from '../utility/matrices';
import * as arrayUtils from '../utility/arrayUtils';
import { Creature } from '../creature';
import { Effect } from '../effect';
import { Direction } from '../utility/hex';

/** Creates the abilities
 * @param {Object} G the game object
 * @return {void}
 */
export default (G) => {
	G.abilities[40] = [
		/**
		 * First Ability: Tentacle Bush
		 * When ending the Nutcase's turn, it gains the "Tentacle Bush" effect which:
		 * - makes the Nutcase immovable until its next turn
		 * - applies an effect against melee attackers
		 * - lasts until its next turn
		 * - is never active during the Nutcase's own turn making this a defensive ability.
		 *
		 * The effect applied to attackers:
		 * - makes the attacker immovable (roots them in place)
		 * - if upgraded, makes the attacker's abilities cost +5 energy
		 * - lasts until the end of the attacker's current turn
		 * - does not stack (i.e. not +10 energy for two attacks)
		 */
		{
			trigger: 'onEndPhase',

			require: function () {
				// Always true to highlight ability
				return true;
			},

			activate: function () {
				const immoveableEffect = new Effect(
					// This effect shows the Nutcase being affected by Tentacle Bush in the UI.
					this.title,
					this.creature,
					this.creature,
					'',
					{
						alterations: {
							moveable: false,
						},
						deleteTrigger: 'onStartPhase',
						turnLifetime: 1,
					},
					G,
				);

				const damageShieldEffect = new Effect(
					// Don't show two effects in the log.
					'',
					this.creature,
					this.creature,
					'onUnderAttack',
					{
						effectFn: (...args) => this._activateOnAttacker(...args),
						deleteTrigger: 'onStartPhase',
						turnLifetime: 1,
					},
					G,
				);

				this.creature.addEffect(immoveableEffect);
				this.creature.addEffect(damageShieldEffect);

				this.end(
					/* Suppress "uses ability" log message, just show the "affected by" Effect
					log message. */
					true,
				);
			},

			_activateOnAttacker: function (effect, damage) {
				// Must take melee damage from a non-trap source
				if (damage === undefined || !damage.melee || damage.isFromTrap) {
					return false;
				}

				// Target becomes unmovable until end of their phase
				let o = {
					alterations: {
						moveable: false,
					},
					deleteTrigger: 'onEndPhase',
					// Delete this effect as soon as attacker's turn finishes
					turnLifetime: 1,
					creationTurn: G.turn - 1,
					deleteOnOwnerDeath: true,
					stackable: false,
				};

				// If upgraded, target abilities cost more energy
				if (this.isUpgraded()) {
					o.alterations.reqEnergy = 5;
				}

				const attackerEffect = new Effect(
					this.title,
					this.creature, // Caster
					damage.attacker, // Target
					'', // Trigger
					o,
					G,
				);

				damage.attacker.addEffect(
					attackerEffect,
					`%CreatureName${attackerEffect.target.id}% has been grasped by tentacles`,
				);

				// Making attacker unmovable will change its move query, so update it
				if (damage.attacker === G.activeCreature) {
					damage.attacker.queryMove();
				}
			},
		},

		//	Second Ability: Hammer Time
		{
			//	Type : Can be "onQuery", "onStartPhase", "onDamage"
			trigger: 'onQuery',

			_targetTeam: Team.enemy,

			//	require() :
			require: function () {
				if (!this.testRequirements()) {
					return false;
				}

				if (
					!this.atLeastOneTarget(this.creature.getHexMap(matrices.frontnback2hex), {
						team: this._targetTeam,
					})
				) {
					return false;
				}

				return true;
			},

			//	query() :
			query: function () {
				let ability = this;

				if (!this.isUpgraded()) {
					G.grid.queryCreature({
						fnOnConfirm: function () {
							ability.animation(...arguments);
						},
						team: this._targetTeam,
						id: this.creature.id,
						flipped: this.creature.flipped,
						hexes: this.creature.getHexMap(matrices.frontnback2hex),
					});
				} else {
					// If upgraded, show choice of front and back hex groups
					let choices = [
						this.creature.getHexMap(matrices.front2hex),
						this.creature.getHexMap(matrices.back2hex),
					];
					G.grid.queryChoice({
						fnOnSelect: function (choice, args) {
							G.activeCreature.faceHex(args.hex, undefined, true);
							args.hex.overlayVisualState('creature selected player' + G.activeCreature.team);
						},
						fnOnConfirm: function () {
							ability.animation(...arguments);
						},
						team: this._targetTeam,
						id: this.creature.id,
						choices: choices,
					});
				}
			},

			activate: function (targetOrChoice, args) {
				let ability = this;
				ability.end();

				if (!this.isUpgraded()) {
					this._activateOnTarget(targetOrChoice);
				} else {
					// We want to order the hexes in a clockwise fashion, unless the player
					// chose the last clockwise hex, in which case order counterclockwise.
					// Order by y coordinate, which means:
					// - y ascending if
					//   - front choice (choice 0) and not bottom hex chosen, or
					//   - back choice (choice 1) and top hex chosen
					// - otherwise, y descending
					let isFrontChoice = args.choiceIndex === 0;
					let yCoords = targetOrChoice.map(function (hex) {
						return hex.y;
					});
					let yMin = Math.min.apply(null, yCoords);
					let yMax = Math.max.apply(null, yCoords);
					let yAscending;
					if (isFrontChoice) {
						yAscending = args.hex.y !== yMax;
					} else {
						yAscending = args.hex.y === yMin;
					}
					targetOrChoice.sort(function (a, b) {
						return yAscending ? a.y - b.y : b.y - a.y;
					});
					for (let i = 0; i < targetOrChoice.length; i++) {
						let target = targetOrChoice[i].creature;
						// only attack enemies
						if (!target || !isTeam(this.creature, target, this._targetTeam)) {
							continue;
						}
						this._activateOnTarget(target);
					}
				}
			},

			_activateOnTarget: function (target) {
				let ability = this;

				// Target takes pierce damage if it ever moves
				let effect = new Effect(
					'Hammered', // Name
					this.creature, // Caster
					target, // Target
					'onStepOut', // Trigger
					{
						effectFn: function (eff) {
							const waitForMovementComplete = (message, payload) => {
								if (message === 'movementComplete' && payload.creature.id === eff.target.id) {
									this.game.signals.creature.remove(waitForMovementComplete);

									eff.target.takeDamage(
										new Damage(
											eff.owner,
											{
												pierce: ability.damages.pierce,
											},
											1,
											[],
											G,
										),
									);
									eff.deleteEffect();
								}
							};

							// Wait until movement is completely finished before processing effects.
							this.game.signals.creature.add(waitForMovementComplete);
						},
					},
					G,
				);

				let damage = new Damage(
					this.creature, // Attacker
					this.damages, // Damage Type
					1, // Area
					[effect], // Effects
					G,
				);

				target.takeDamage(damage);
			},
		},

		// 	Third Ability: War Horn
		{
			trigger: 'onQuery',

			_directions: [0, 1, 0, 0, 1, 0], // forward/backward
			_targetTeam: Team.enemy,

			//	require() :
			require: function () {
				if (!this.testRequirements()) {
					return false;
				}
				if (
					!this.testDirection({
						team: this._targetTeam,
						directions: this._directions,
					})
				) {
					return false;
				}
				return true;
			},

			query: function () {
				let ability = this;

				let o = {
					fnOnConfirm: function () {
						console.log('fnOnConfirm', arguments);
						ability.animation(...arguments);
					},
					team: this._targetTeam,
					requireCreature: true,
					id: this.creature.id,
					sourceCreature: this.creature,
					x: this.creature.x,
					y: this.creature.y,
					directions: this._directions,
					dashedHexesAfterCreatureStop: false,
				};

				if (!this.isUpgraded()) {
					G.grid.queryDirection(o);
				} else {
					o.dashedHexesAfterCreatureStop = true;
					// Create custom choices containing normal directions plus hex choices
					// past the first creature, extending up to the next obstacle
					o = G.grid.getDirectionChoices(o);

					console.log(o);

					// // let newChoices = [];

					// for (let i = 0; i < o.choices.length; i++) {
					// 	const pushLine = this._getPushLine(o, o.choices[i]);
					// 	console.log({ pushLine });
					// 	o.hexesDashed = o.hexesDashed.concat(pushLine);

					// 	console.log(o.hexesDashed);

					// 	// // For each dashed hex, create a new choice composed of the original
					// 	// // choice, extended up to and including the dashed hex. This will be the
					// 	// // choice that pushes the target up to that hex.
					// 	// // Get a new hex line so that the hexes are in the right order
					// 	// let newChoice = G.grid.getHexLine(o.x + fx, o.y, direction, o.flipped);
					// 	// // Exclude creature
					// 	// ability.creature.hexagons.forEach(function (hex) {
					// 	// 	if (arrayUtils.findPos(newChoice, hex)) {
					// 	// 		arrayUtils.removePos(newChoice, hex);
					// 	// 	}
					// 	// });

					// 	// // Exclude hexes that don't exist in the original choice
					// 	// for (j = 0; j < newChoice.length; j++) {
					// 	// 	if (!arrayUtils.findPos(o.choices[i], newChoice[j])) {
					// 	// 		arrayUtils.removePos(newChoice, newChoice[j]);
					// 	// 		j--;
					// 	// 	}
					// 	// }
					// 	// // Extend choice to include each dashed hex in succession
					// 	// for (j = 0; j < line.length; j++) {
					// 	// 	newChoice.push(line[j]);
					// 	// 	newChoices.push(newChoice.slice());
					// 	// }
					// 	// newChoices.push(line);
					// }
					// o.choices = o.choices.concat(newChoices);
					// console.log('final o.choices', o.choices);
					o.requireCreature = false;

					G.grid.queryChoice(o);
				}
			},

			/**
			 *
			 * @param {*} path
			 * @param {*} args
			 * @param {object} extra
			 * @param {object} extra.queryOptions Original options object used to query the ability.
			 */
			activate: function (path, args, extra) {
				let i;
				const ability = this;
				const nutcase = this.creature;
				ability.end();

				// Find:
				// - the target which is the first creature in the path
				// - the run path which is up to the creature
				// - the push paths which start from the last creature hex and continues to
				//   the rest of the path
				let target;
				let runPath;
				const pushPath = extra?.queryOptions?.hexesDashed || [];
				for (i = 0; i < path.length; i++) {
					if (path[i].creature) {
						target = path[i].creature;
						runPath = path.slice(0, i);
						break;
					}
				}

				console.log({ path, runPath, pushPath });

				// Calculate damage, extra damage per hex distance
				const damages = $j.extend({}, this.damages);
				// TODO: damage based on full path
				damages.pierce += runPath.length;
				const damage = new Damage(nutcase, damages, 1, [], G);

				// Move towards target if necessary
				if (runPath.length > 0) {
					let destination = arrayUtils.last(runPath);
					if (args.direction === Direction.Left) {
						destination = G.grid.hexes[destination.y][destination.x + nutcase.size - 1];
					}

					G.grid.cleanReachable();
					nutcase.moveTo(destination, {
						overrideSpeed: 100,
						ignoreMovementPoint: true,
						callback: function () {
							let interval = setInterval(function () {
								if (!G.freezedInput) {
									clearInterval(interval);

									const frontHexes = ability.creature.getHexMap(
										matrices.inlinefront2hex,
										(nutcase.player.flipped && args.direction === Direction.Right) ||
											args.direction === Direction.Left,
									);
									console.log({ frontHexes });

									// Check that the target is still in the same place (for evades).
									if (
										ability
											.getTargets(frontHexes)
											.some((hexTarget) => hexTarget.target.id === target.id)
									) {
										target.takeDamage(damage);

										console.log(target, pushPath, args);

										if (!ability._pushTarget(target, runPath, pushPath, args)) {
											G.activeCreature.queryMove();
										}
									}
								}
							}, 100);
						},
					});
				} else {
					target.takeDamage(damage);

					if (!ability._pushTarget(target, runPath, pushPath, args)) {
						G.activeCreature.queryMove();
					}
				}
			},

			/**
			 *
			 * @param {*} o
			 * @returns
			 */
			_calculatePushLineOffset(o, choice) {
				const direction = choice[0].direction;
				let xOffset = 0;

				if (o.sourceCreature instanceof Creature) {
					if (
						// Left 3 directions.
						(!o.sourceCreature.player.flipped && direction > Direction.DownRight) ||
						// Right 3 directions.
						(o.sourceCreature.player.flipped && direction < Direction.DownLeft)
					) {
						xOffset = -(o.sourceCreature.size - 1);
					}
				}

				return xOffset;
			},

			/**
			 *
			 * @param {*} o
			 */
			_getPushLine(o, choice) {
				const direction = choice[0].direction;
				// Add dashed hexes up to the next obstacle for this direction choice
				const xOffset = this._calculatePushLineOffset(o, choice);
				// TODO: limit line to one hex length.
				const line = G.grid.getHexLine(o.x + xOffset, o.y, direction, o.flipped);
				console.log({ choice, xOffset, line });
				choice.forEach(function (choice) {
					arrayUtils.removePos(line, choice);
				});

				arrayUtils.filterCreature(line, false, true, o.id);

				return line;
			},

			_pushTarget: function (target, runPath, pushPath, args) {
				const ability = this;
				const creature = this.creature;

				console.log(
					'selfPushPath calc',
					target.hexagons,
					target.hexagons.slice(0, pushPath.length),
					pushPath.slice(0, pushPath.length - target.hexagons.length),
				);

				let selfPushPath = [
					...this.game.grid
						.sortHexesByDirection(target.hexagons, args.direction)
						.slice(0, pushPath.length),
					...pushPath.slice(0, pushPath.length - target.hexagons.length),
				].sort((a, b) => (args.direction === Direction.Right ? a.x - b.x : b.x - a.x));
				selfPushPath = this.game.grid.sortHexesByDirection(selfPushPath, args.direction);
				const targetPushPath = pushPath.slice();
				// TODO: These lines are vital do not remove. Refactor so what they do is more readable
				arrayUtils.filterCreature(targetPushPath, false, false, creature.id);
				arrayUtils.filterCreature(targetPushPath, false, false, target.id);

				console.log({ target, runPath, pushPath, selfPushPath, targetPushPath, args });

				if (targetPushPath.length === 0) {
					return false;
				}

				// Push the creature one hex at a time
				// As we need to move creatures simultaneously, we can't use the normal path
				// calculation as the target blocks the path
				let i = 0;
				let interval = setInterval(function () {
					if (!G.freezedInput) {
						if (
							i === targetPushPath.length ||
							creature.dead ||
							target.dead ||
							!creature.stats.moveable ||
							!target.stats.moveable
						) {
							clearInterval(interval);
							creature.facePlayerDefault();
							G.activeCreature.queryMove();
						} else {
							let hex = selfPushPath[i];
							let targetHex = targetPushPath[i];
							if (args.direction === Direction.Left) {
								hex = G.grid.hexes[hex.y][hex.x + creature.size - 1];
								targetHex = G.grid.hexes[targetHex.y][targetHex.x + target.size - 1];
							}
							ability._pushOneHex(target, hex, targetHex);
							i++;
						}
					}
				});

				return true;
			},

			_pushOneHex: function (target, hex, targetHex) {
				const opts = {
					overrideSpeed: 100,
					ignorePath: true,
					ignoreMovementPoint: true,
					turnAroundOnComplete: false,
				};

				// Note: order matters here; moving ourselves first results on overlapping
				// hexes momentarily and messes up creature hex displays
				target.moveTo(
					targetHex,
					$j.extend(
						{
							animation: 'push',
						},
						opts,
					),
				);
				this.creature.moveTo(hex, opts);
			},
		},

		//	Fourth Ability: Fishing Hook
		{
			//	Type : Can be "onQuery", "onStartPhase", "onDamage"
			trigger: 'onQuery',

			_targetTeam: Team.enemy,

			require: function () {
				let ability = this;
				if (!this.testRequirements()) {
					return false;
				}

				if (
					!this.atLeastOneTarget(this.creature.getHexMap(matrices.inlinefrontnback2hex), {
						team: this._targetTeam,
						optTest: function (creature) {
							// Size restriction of 2 if unupgraded
							return ability.isUpgraded() ? true : creature.size <= 2;
						},
					})
				) {
					return false;
				}
				return true;
			},

			//	query() :
			query: function () {
				let ability = this;

				G.grid.queryCreature({
					fnOnConfirm: function () {
						ability.animation(...arguments);
					},
					team: this._targetTeam,
					id: this.creature.id,
					flipped: this.creature.flipped,
					hexes: this.creature.getHexMap(matrices.inlinefrontnback2hex),
					optTest: function (creature) {
						// Size restriction of 2 if unupgraded
						return ability.isUpgraded() ? true : creature.size <= 2;
					},
				});
			},

			//	activate() :
			activate: function (target) {
				let ability = this;
				let crea = ability.creature;
				ability.end();

				let damage = new Damage(
					crea, // Attacker
					ability.damages, // Damage Type
					1, // Area
					[], // Effects
					G,
				);

				let inlinefront2hex = matrices.inlinefront2hex;

				let trgIsInfront =
					G.grid.getHexMap(
						crea.x - inlinefront2hex.origin[0],
						crea.y - inlinefront2hex.origin[1],
						0,
						false,
						inlinefront2hex,
					)[0].creature == target;

				let creaX = target.x + (trgIsInfront ? 0 : crea.size - target.size);
				crea.moveTo(G.grid.hexes[target.y][creaX], {
					ignorePath: true,
					ignoreMovementPoint: true,
					callback: function () {
						crea.updateHex();
						crea.queryMove();
					},
				});
				let targetX = crea.x + (trgIsInfront ? target.size - crea.size : 0);
				target.moveTo(G.grid.hexes[crea.y][targetX], {
					ignorePath: true,
					ignoreMovementPoint: true,
					callback: function () {
						target.updateHex();
						target.takeDamage(damage);
					},
				});
			},
		},
	];
};
