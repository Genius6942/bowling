import Game from './components/game.js';

window.addEventListener('load', () => {
	window.game = new Game();
	window.addEventListener('keydown', (e) => {
		if (e.key == 'r' && location.href.includes('99883536-e524-4767-b063-5a47cf17279f.id.repl.co')) {
			location.href = '/404';
		}
	});
});