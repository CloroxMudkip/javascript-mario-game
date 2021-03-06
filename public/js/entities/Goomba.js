import Entity, {Trait} from '../Entity.js';
import LeftRightWalk from '../traits/LeftRightWalk.js'
import Killable from '../traits/Killable.js'
import {loadSpriteSheet} from '../loaders.js';

export function loadGoomba() {
    return loadSpriteSheet('goomba').then(createGoombaFactory);
}

class Behavior extends Trait {
    constructor() {
        super('behavior');
    }

    collides(us, them) {
        if (us.killable.dead) return;

        if (them.stomper) {
            if (them.vel.y > us.vel.y) {
                us.leftrightwalk.speed = 0;
                us.killable.kill();
            } else {
                them.killable.kill();
            }
        }
    }
}

function createGoombaFactory(sprite) {
    const walkAnim = sprite.animations.get('walk');
    function routeAnim(goomba) {
        if (goomba.killable.dead) return 'flat';
        return walkAnim(goomba.lifetime)
    }
    function drawGoomba(ctx) {
        sprite.draw(routeAnim(this), ctx, 0, 0);
    }

    return function createGoomba() {
        const goomba = new Entity();
        goomba.size.set(16, 16);
        goomba.addTrait(new LeftRightWalk());
        goomba.addTrait(new Behavior());
        goomba.addTrait(new Killable());
        goomba.draw = drawGoomba;
        return goomba;
    }
}