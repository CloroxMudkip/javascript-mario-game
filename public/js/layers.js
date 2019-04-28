export function createBackgroundLayer(level, sprites) {
    const tiles = level.tiles;
    const resolver = level.tileCollider.tiles;

    const buffer = document.createElement('canvas');
    buffer.width = 256 + 16;
    buffer.height = 240;

    const ctx = buffer.getContext('2d');

    let startIndex, endIndex;
    function redraw(drawFrom, drawTo) {
        startIndex = drawFrom;
        endIndex = drawTo;

        for (let x = startIndex; x <= endIndex; ++x) {
            const col = tiles.grid[x];
            if(col) {
                col.forEach((tile, y) => {
                    if(sprites.animations.has(tile.name)) {
                        sprites.drawAnim(tile.name, ctx, x - startIndex, y, level.totalTime);
                    } else {
                        sprites.drawTile(tile.name, ctx, x - startIndex, y);
                    }
                });
            }
        }
    }

    return function drawBackgroundLayer(ctx, camera) {
        const drawWidth = resolver.toIndex(camera.size.x);
        const drawFrom = resolver.toIndex(camera.pos.x);
        const drawTo = drawFrom + drawWidth;
        redraw(drawFrom, drawTo);

        ctx.drawImage(buffer, -camera.pos.x % 16, -camera.pos.y);
    };
}

export function createSpriteLayer(entities, width = 64, height = 64) {
    const spriteBuffer = document.createElement('canvas');
    spriteBuffer.width = width;
    spriteBuffer.height = height;
    const spriteBufferContext = spriteBuffer.getContext('2d');

    return function drawSpriteLayer(ctx, camera) {
        entities.forEach(entity => {
            spriteBufferContext.clearRect(0, 0, width, height);

            entity.draw(spriteBufferContext);
            ctx.drawImage(
                spriteBuffer,
                entity.pos.x - camera.pos.x, 
                entity.pos.y - camera.pos.y
            )
        });
    };
}

export function createCollisionLayer(level) {
    const resolvedTiles = [];
    const tileResolver = level.tileCollider.tiles;
    const tileSize = tileResolver.tileSize;
    const getByIndexOriginal = tileResolver.getByIndex;
    tileResolver.getByIndex = function getByIndexFake(x, y) {
        resolvedTiles.push({x, y});
        return getByIndexOriginal.call(tileResolver, x, y);
    }

    return function drawCollision(ctx, camera) {
        ctx.strokeStyle = 'lime';
        resolvedTiles.forEach(({x, y}) => {
            ctx.beginPath();
            ctx.rect(
                x * tileSize - camera.pos.x, 
                y * tileSize - camera.pos.y, 
                tileSize, tileSize);
            ctx.stroke();
        });

        level.entities.forEach(entity => {
            ctx.strokeStyle = 'magenta';
            ctx.beginPath();
            ctx.rect(
                entity.pos.x - camera.pos.x, 
                entity.pos.y - camera.pos.y,
                entity.size.x,
                entity.size.y);
            ctx.stroke();
        });

        resolvedTiles.length = 0;   
    }
}

export function createCameraLayer(cameraToDraw) {
    return function drawCameraRect(ctx, fromCamera) {
        ctx.strokeStyle = 'purple';
        ctx.beginPath();
        ctx.rect(
            cameraToDraw.pos.x - fromCamera.pos.x, 
            cameraToDraw.pos.y - fromCamera.pos.y,
            cameraToDraw.size.x,
            cameraToDraw.size.y);
        ctx.stroke();
    }
}