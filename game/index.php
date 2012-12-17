<?php
/* Ancient Beast - Free Open Source Online PvP TBS: card game meets chess, with creatures.
 * Copyright (C) 2007-2012  Valentin Anastase (a.k.a. Dread Knight)
 *
 * This file is part of Ancient Beast.
 *
 * Ancient Beast is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Ancient Beast is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * http://www.AncientBeast.com
 * https://github.com/FreezingMoon/AncientBeast
 * DreadKnight@FreezingMoon.org
 */

$page_title = "Ancient Beast - Game";
require_once("../header.php");
require_once("../global.php");
start_segment();
echo "<div class='center'><a href='https://github.com/FreezingMoon/AncientBeast' target='_blank'><b>Under HEAVY development! Click here for issue tracker and github repository.</b></a></div>";
separate_segment();
echo "<div class='center'><a href='http://AncientBeast.com/combat' target='_blank'><img src='launcher.jpg' width=890 height=400><h3 style='position:absolute; top:325px; left:100px;'>Launch Developer Preview [HotSeat]</h3></a></div>";
//separate_segment();
//echo "<div class='center'>Arcade mode<br>1vs1/2vs2/spectate(watch others play or sign up to get notified of important scheduled matches); casual mode (fixed lvl 50, all creatures available but in common, no account required, no rewards, no items, no stats, no Godlet configuration), sinner mode (fixed lvl 50, full stack of creatures from a sin, no accoutn required, no rewards, no items, no stats, no Godlet configuration), trivia mode(fixed lvl 50, all creatures available but in common, no account required, no rewards, no items, no stats, no Godlet configuration); gambling (bet bitcoins on scheduled matches); Advanced mode<br>Ladder (rankings, normal exp and gold), Hardcore (one life, bonus exp and gold; if defeated, must purchase new life); Expert mode<br>Tournament (entry fee, estimated prize, status, rankings, scheduled matches, previous champions), Rankings (charts with classifications and scheduled matches; also previous champions listed), Challenge (fight the Sins and Ancient Beast)</div>";
//TODO: move stuff above to just a pre-match screen; login box; provide video tutorial and showcase/explain various display modes and such, like braile/2d-static/2d-animated/3d/augmented-reality/virtual-reality/holographic/etc; link/QR code smartphone gamepad (image with smartphone = gamepad) as instalable app (it would need to be powered up by scanning a QR code); rankings; tournament planification; invite friends for rewards?; include recent change log?
separate_segment("requirements"); ?>
<h3 class="indexheader"><a href="#requirements">Requirements</a></h3>

<ul>
<li>internet connection</li>
<li>a <a href="http://www.google.com/chrome" target="_blank">modern browser</a> with HTML 5 support and JavaScript enabled</li>
<li>500 MHz Processor</li>
<li>256 MB RAM</li>
<li>200 MB HDD</li>
<li>64 MB Video Card</li>
<li>controller (keyboard, mouse, gamepad, touch screen, smartphone or tablet)</li>
</ul>
<p>Best played at Full HD resolution (1920x1080), with stereo speakers, using <a href="http://www.google.com/chrome" target="_blank"><u>Google Chrome</u></a>.<br>
While playing on a smartphone, it is highly recommended using a stylus.</p>
<?php separate_segment();
include("../utils/disqus.php");
end_segment();	
end_page();
?>
